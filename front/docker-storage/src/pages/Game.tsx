import { useContext, useEffect, useState } from 'react';
import { useDisclosure, useListState } from '@mantine/hooks';
import { DragDropContext, DraggableLocation } from '@hello-pangea/dnd';
import {
  Anchor,
  Button,
  CopyButton,
  Divider,
  Flex,
  Group,
  HoverCard,
  Modal,
  Paper, Space,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import '../App.css';
import { notifications } from '@mantine/notifications';
import GameInterface, { AnswerCardInterface, User } from '../Interfaces.ts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons/faCrown';
import Voting from '../components/Voting.tsx';
import { SocketContext } from '../contexts/SocketContext.tsx';
import { SocketContextType } from '../contexts/@types.socket.ts';
import { GameContext } from '../contexts/GameContext.tsx';
import { GameContextType } from '../contexts/@types.game.ts';
import QuestionCard from '../components/QuestionCard.tsx';
import Playing from '../components/Playing.tsx';
import { modals } from '@mantine/modals';
import { faBars, faCopy } from '@fortawesome/free-solid-svg-icons';

export default function Game() {
  const [gameCode] = useState((new URLSearchParams(window.location.search)).get('code'));
  const [name, setName] = useState<string>('');

  const [playedCards, setPlayedCards] = useListState<{ id: number, text: string }>([]);
  const [answerCards, setAnswerCards] = useListState([{ id: 0, text: '' }]);
  const [waitingUsers, setWaitingUsers] = useState<string[]>([]);
  const [allPlayedCards, setAllPlayedCards] = useState<AnswerCardInterface[][]>([]);
  const [winner, setWinner] = useState<string>('');

  const { socket, socketSend } = useContext(SocketContext) as SocketContextType;
  const { game, updateGame } = useContext(GameContext) as GameContextType;

  const [opened, { close }] = useDisclosure(true);

  function handleErrors(message: string) {
    console.error(message);
    if (message === 'not found' && !game) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Game not found',
      });

      location.href = '/';
    } else
      notifications.show({
        color: 'red',
        title: 'Error',
        message: message,
      });
  }


  function gameInfos(payload: any) {
    switch (payload?.event) {
      case 'game':
        updateGame(payload.game);
        break;
      case 'cards':
        getCards(payload.cards);
        break;
      case 'waiting':
        setWaitingUsers(payload.waiting.map((user: User) => user.name));
        break;
      case 'voting':
        setAllPlayedCards(payload.cards);
        break;
      case 'round':
        setWinner(payload.winner.name);
        setTimeout(() => {
          setWinner('');
        }, 5000);
        setWaitingUsers(payload.game.users
          .filter((user: User) => user.id !== payload.game.askerId)
          .map((user: User) => user.name),
        );
        setAllPlayedCards([]);
        setPlayedCards.remove(...Array.from({ length: playedCards.length }, (_, i) => i));
        updateGame(payload.game);
        break;
      case 'end':
        endGame(payload);
        break;
      case 'leave':
        notifications.show({
          color: 'blue',
          title: 'Déconnexion',
          message: `${payload.leaver} a quitté la partie`,
        });
        break;
    }
  }

  function joinGame() {
    socketSend('join', { code: gameCode, name });
  }

  function joinHandler(payload: GameInterface) {
    updateGame(payload);
  }

  function startGame() {
    socketSend('start', { code: gameCode });
  }

  function getCards(payload: AnswerCardInterface[]) {
    setAnswerCards.remove(...Array.from({ length: answerCards.length }, (_, i) => i));
    setAnswerCards.setState(payload);
  }

  function endGame(payload: { winner: string }) {
    modals.open({
      title: 'Fin de partie',
      children: (
        <Flex direction={'column'} align={'center'}>
          {payload.winner ?
            <Text>{payload.winner} remporte la partie !</Text> :
            <Text>Partie terminée par manque de joueurs</Text>
          }
          <Table withTableBorder withRowBorders p={'md'} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta={'right'}>Joueur</Table.Th>
                <Table.Th ta={'left'}>Score</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {game?.users
                .sort((a, b) => b.score - a.score)
                .map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td ta={'right'}>{user.name}</Table.Td>
                    <Table.Td ta={'left'}>{user.score}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
          <Anchor href={'/'}>
            <Button>Retourner a l'accueil</Button>
          </Anchor>
        </Flex>
      ),
      withCloseButton: false,
      onClose: () => {
      },
    });
  }

  useEffect(() => {
    socket?.on('error', handleErrors);
    socket?.on('join', joinHandler);
    if (gameCode) {
      socket?.on(gameCode, gameInfos);
    }
    return () => {
      socket?.off('error', handleErrors);
      socket?.off('join', joinHandler);
      if (gameCode)
        socket?.off(gameCode, gameInfos);
    };
  }, [gameInfos, gameCode]);

  useEffect(() => {
    if (game?.users.find((user) => user.id === socket?.id))
      close();
  }, [game, socket]);

  useEffect(() => {
    if (socket?.id)
      socketSend('checkGame', { code: gameCode });
  }, []);


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
        <Modal opened={opened}
               centered
               onClose={name ? joinGame : () => {
               }}
               withCloseButton={false}
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
            }}>
              Valider
            </Button>
          </Flex>
        </Modal>

        <Flex direction="column" align={'center'} w={'100%'} h={'100%'} gap={'xs'}>
          <CopyButton value={window.location.href}>
            {({ copied, copy }) => (
              <Button variant={'transparent'} onClick={copy} size={'xl'} p={0} w={'100%'}>
                {copied ?
                  'Copié' :
                  <>
                    {gameCode} <Space mx={5}/>
                    <FontAwesomeIcon icon={faCopy} />
                  </>
                }
              </Button>
            )}
          </CopyButton>
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
            <Button onClick={startGame} disabled={(game?.users.length ?? 0) < 3} m={'xs'}>
              Démarrer la partie
            </Button>
            : null
          }
        </Flex>
      </Flex>
    );

  return (
    <Flex direction={'column'} justify={'space-between'} align={'center'}>
      <Group pos={'fixed'} top={0} right={0}>
        <HoverCard width={280} shadow={'md'}>
          <HoverCard.Target>
            <Button bg={'gray'} m={'xs'} p={'xs'}><FontAwesomeIcon icon={faBars} /></Button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Table withTableBorder withRowBorders p={'md'} highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th ta={'right'}>Joueur</Table.Th>
                  <Table.Th ta={'left'}>Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {game?.users
                  .sort((a, b) => b.score - a.score)
                  .map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td ta={'right'} fs={user.id === socket?.id ? 'italic' : undefined}>{user.name}</Table.Td>
                      <Table.Td ta={'left'}>{user.score}</Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
      <QuestionCard question={game.question?.text ?? ''} />
      <Text>{winner ? `${winner} remporte la manche !` : null}</Text>
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
        <Flex direction={'column'} align={'center'}>
          {!allPlayedCards.length ?
            <Text p={'xl'}>En attente de {waitingUsers.join(', ')}</Text> : null}
          {allPlayedCards.length === game.users.length - 1 ?
            <Voting playerNumber={game.users.length - 1} cards={allPlayedCards}
                    isAsker={game.askerId === socket?.id}
                    askerName={game.users.find((user) => user.id === game.askerId)?.name ?? 'inconnu'}
            />
            : null
          }

          {socket?.id !== game.askerId && !allPlayedCards.length ?
            <Playing playedCards={playedCards} answerCards={answerCards} />
            : null
          }
        </Flex>

      </DragDropContext>
    </Flex>
  );
}
