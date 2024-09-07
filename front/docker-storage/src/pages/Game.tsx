import { useEffect, useState } from 'react';
import { useDisclosure, useListState } from '@mantine/hooks';
import io, { Socket } from 'socket.io-client';
import { DragDropContext, Draggable, DraggableLocation, Droppable } from '@hello-pangea/dnd';
import { Button, Card, Center, Divider, Flex, Modal, Paper, Skeleton, Text, TextInput, Title } from '@mantine/core';
import AnswerCard from '../components/AnswerCard.tsx';
import '../App.css';
import { notifications } from '@mantine/notifications';
import GameInterface from '../Interfaces.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons/faCrown';

export default function Game() {
  const [gameCode] = useState((new URLSearchParams(window.location.search)).get('code'));
  const [name, setName] = useState<string>('');
  const [game, setGame] = useState<GameInterface>();

  const [question] = useState('Question 1');
  const [playedCards, setPlayedCards] = useListState<{ id: number, text: string }>([]);
  const [answerCards, setAnswerCards] = useListState([{ id: 0, text: '' }]);

  const [socket, setSocket] = useState<Socket>();
  const [socketReady, setSocketReady] = useState(socket?.connected);

  const [opened, { close }] = useDisclosure(true);


  function socketSend(event: string, message: {} = {}) {
    console.log('event: ' + event);
    console.log({ id: socket?.id, ...message });
    socket?.emit(event, { id: socket?.id, ...message });
  }

  function handleErrors(message: string) {
    console.log(message);
    if (message === 'not found' && !game) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Game not found',
      });

      location.href = '/';
    }
  }

  useEffect(() => {
    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);
  }, [setSocket]);

  socket?.on('connect', () => {
    setSocketReady(true);
  });

  useEffect(() => {
    if (!socketReady)
      return;
    console.log('send check');
    socketSend('checkGame', { code: gameCode });
  }, [socketReady]);


  function gameInfos(payload: any) {
    console.log('gameInfos');
    console.log(payload);
    if (payload?.event === 'game')
      setGame(payload.game);
  }

  function joinGame() {
    socketSend('join', { code: gameCode, name });
  }

  function startGame() {
    socketSend('start', { code: gameCode });
  }

  useEffect(() => {
    socket?.on('error', handleErrors);
    if (gameCode)
      socket?.on(gameCode, gameInfos);
    return () => {
      socket?.off('error', handleErrors);
      if (gameCode)
        socket?.off(gameCode, gameInfos);
    };
  }, [gameInfos, gameCode]);

  useEffect(() => {
    console.log(game);
    if (game?.users.find((user) => user.id === socket?.id))
      close();
  }, [game, socket]);


  function validate(): void {
  }

  const move = (source: { id: number, text: string }[],
                destination: { id: number, text: string }[],
                droppableSource: DraggableLocation,
                droppableDestination: DraggableLocation,
  ) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);

    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: any = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  function getList(id: string) {
    return id === 'answer-cards' ? answerCards : playedCards;
  }

  if (!game?.started)
    return (
      <Flex align={'center'} justify={'space-evenly'}>
        <Skeleton visible={!socketReady}>
          <Modal opened={opened}
                 centered
                 onClose={name ? joinGame : () => {
                 }}
                 title={'Entrez votre pseudo'}
                 size={'auto'}
                 overlayProps={{
                   backgroundOpacity: 0.5,
                   blur: 3,
                 }}
          >
            <Flex align={'center'} direction={'column'} gap={'md'}>
              <TextInput data-autofocus value={name} onChange={(e) => setName(e.target.value)} />
              <Button onClick={name ? joinGame : () => {
              }}>Valider</Button>
            </Flex>
          </Modal>
        </Skeleton>

        <Flex direction="column" align={'center'} w={'100%'} h={'100%'} gap={'md'}>
          <Paper radius={'md'} withBorder mih={'30vh'} p={'sm'} maw={550} miw={250}>
            <Title m={'md'}> {game?.users.length ?? 0} Joueurs </Title>
            <Divider m={'sm'} />
            {game?.users.map((user, i) => (
              <Text key={i} fs={user.id === socket?.id ? 'italic' : undefined}>
                {user.id === game?.ownerId ? (<><FontAwesomeIcon icon={faCrown} /> &nbsp;</>) : null}
                {user.name}
              </Text>),
            )}
          </Paper>
          {socket?.id === game?.ownerId ?
            <Button onClick={startGame} disabled={(game?.users.length ?? 0) < 3}>Start game</Button>
            : null
          }
        </Flex>
      </Flex>
    );

  return (
    <>
      <Center>
        <Card shadow={'sm'} withBorder radius={'lg'}
              w={160} h={225} pos={'absolute'} top={15} bg={'dark'}>
          <Text c={'white'} size={'sm'} ta={'left'}>{question}</Text>
        </Card>
      </Center>
      <DragDropContext
        onDragEnd={({ destination, source }) => {

          if (!destination)
            return;

          if (source.droppableId === destination.droppableId) {
            setAnswerCards.reorder({ from: source.index, to: destination?.index || 0 });
          } else {
            const result = move(
              getList(source.droppableId),
              getList(destination.droppableId),
              source,
              destination,
            );

            setAnswerCards.setState(result['answer-cards']);
            setPlayedCards.setState(result['played-cards']);
          }
        }}
      >
        <Flex direction={'column'}>
          <Text fs={'italic'}>Your submission</Text>
          <Card shadow={'sm'} withBorder radius={'lg'}
                w={(game.question?.answer ?? 1) * 160} h={230} pos={'relative'}
                className={'played'}
          >
            <Droppable droppableId={'played-cards'} direction={'horizontal'}
                       isDropDisabled={playedCards.length >= (game.question?.answer ?? 1)}>
              {(provided) => (
                <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                  {playedCards.map((item, index) => (
                    <Draggable key={item.id} index={index} draggableId={item.id + ''}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <AnswerCard text={item.text} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Flex>
              )}
            </Droppable>
          </Card>
          <Button disabled={playedCards.length != (game.question?.answer ?? 1)} m={'sm'} onClick={validate}>
            Validate
          </Button>
        </Flex>

        <Droppable droppableId={'answer-cards'} direction={'horizontal'}>
          {(provided) => (
            <Center>
              <Flex bottom={-30} mx={'sm'} pl={20}
                    pos={'fixed'}
                    className={'hand'}
                    {...provided.droppableProps}
                    ref={provided.innerRef}>
                {answerCards.map((item, index) => (
                  <Draggable key={item.id} index={index} draggableId={item.id + ''}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <AnswerCard text={item.text} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Flex>
            </Center>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
