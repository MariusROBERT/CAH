import { Button, Card, Center, Flex, ScrollArea, Text } from '@mantine/core';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import AnswerCard from './AnswerCard.tsx';
import { AnswerCardInterface } from '../Interfaces.ts';
import { useContext, useState } from 'react';
import { GameContext } from '../contexts/GameContext.tsx';
import { GameContextType } from '../contexts/@types.game.ts';
import { SocketContext } from '../contexts/SocketContext.tsx';
import { SocketContextType } from '../contexts/@types.socket.ts';

interface Props {
  playedCards: AnswerCardInterface[],
  answerCards: AnswerCardInterface[]
}

export default function Playing(props: Props) {
  const { game } = useContext(GameContext) as GameContextType;
  const { socketSend } = useContext(SocketContext) as SocketContextType;
  const [canPlay, setCanPlay] = useState(true);

  function play(): void {
    if (props.playedCards.length === game?.question?.answer) {
      socketSend('play', {
        code: game.code,
        cards: props.playedCards.map((card) => card.id),
      });
      setCanPlay(false);
    }
  }

  return (
    <Flex direction={'column'}>
      <Flex direction={'column'}>
        <Text fs={'italic'}>Vos cartes jouées</Text>
        <Card shadow={'sm'} withBorder radius={'lg'}
              w={{base: (game?.question?.answer ?? 1) * 140 ,xs: (game?.question?.answer ?? 1) * 160}}
              h={{base: 180, xs: 230 }}
              pos={'relative'}
              className={'played'}
        >
          <Droppable droppableId={'played-cards'} direction={'horizontal'}
                     isDropDisabled={props.playedCards.length >= (game?.question?.answer ?? 1)}>
            {(provided) => (
              <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}
                    {...provided.droppableProps}
                    ref={provided.innerRef}>
                {props.playedCards.map((item, index) => (
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
        {canPlay ?
          <Button disabled={props.playedCards.length != (game?.question?.answer ?? 1)} m={'sm'} onClick={play}>
            Valider
          </Button>
          : null
        }
      </Flex>
      <Flex>
        <Droppable droppableId={'answer-cards'} direction={'horizontal'}>
          {(provided) => (
            <Center>
              <ScrollArea maw={'100vw'} pos={'fixed'} left={0} bottom={{ base: -50, xs: -30}} px={'sm'}>
                <Flex className={'hand'}
                      mx={{ base: 'lg', xs: 'md'}}
                      mt={{ base: 50, xs: 30}}
                      {...provided.droppableProps}
                      ref={provided.innerRef}>
                  {props.answerCards.map((item, index) => (
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
              </ScrollArea>
            </Center>
          )}
        </Droppable>
      </Flex>
    </Flex>

  );
}
