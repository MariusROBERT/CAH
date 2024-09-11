import { Button, Card, Flex, ScrollArea, Text } from '@mantine/core';
import AnswerCard from './AnswerCard.tsx';
import { AnswerCardInterface } from '../Interfaces.ts';
import { useContext, useEffect, useState } from 'react';
import { GameContext } from '../contexts/GameContext.tsx';
import { GameContextType } from '../contexts/@types.game.ts';
import { SocketContext } from '../contexts/SocketContext.tsx';
import { SocketContextType } from '../contexts/@types.socket.ts';

interface Props {
  playerNumber: number,
  cards: AnswerCardInterface[][],
  isAsker: boolean | undefined,
  askerName: string,
}

export default function Voting(props: Props) {
  const [pickedCard, setPickedCard] = useState<number>(-1);
  const { game } = useContext(GameContext) as GameContextType;
  const { socket, socketSend } = useContext(SocketContext) as SocketContextType;

  function pickCard() {
    socketSend('vote', { code: game?.code, card: pickedCard });
  }

  function picking(id: number) {
    setPickedCard(id);
    socketSend('voting', { code: game?.code, card: id });
  }

  function gameInfos(payload: any) {
    if (payload?.event === 'picking') {
      setPickedCard(payload.card);
    }
  }

  useEffect(() => {
    if (game?.code)
      socket?.on(game?.code, gameInfos);
    return () => {
      if (game?.code)
        socket?.off(game?.code, gameInfos);
    };
  }, []);

  return (
    <Flex direction={'column'} className={'voting'} align={'center'}>
      <Card shadow={'sm'} withBorder radius={'lg'}
            miw={(((game?.users.length ?? 2) - 1) * (game?.question?.answer ?? 1)) * 160} h={230} pos={'relative'}
            className={'played'}
      >
        <Flex justify={'space-evenly'} h={'100%'} w={'100%'} align={'center'}>
          <ScrollArea maw={'80vw'}>
            {props.isAsker ?
              <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}>
                {
                  props.cards.map((item, i) => (
                    <Flex onClick={() => picking(item[0].id)} direction={'row'} p={'md'} ml={15}
                          className={item[0].id === pickedCard ? 'picked' : undefined} key={i}>
                      {item.map((card) => (
                        <AnswerCard text={card.text} key={card.id} />
                      ))}
                    </Flex>
                  ))
                }
              </Flex>
              :
              <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}>
                {
                  props.cards.map((item, i) => (
                    <Flex direction={'row'} m={'md'} className={item[0].id === pickedCard ? 'picked' : undefined}
                          key={i}>
                      {item.map((card) => (
                        <AnswerCard text={card.text} key={card.id} />
                      ))}
                    </Flex>
                  ))}
              </Flex>
            }
          </ScrollArea>
        </Flex>
      </Card>

      {props.isAsker ?
        <Button m={'sm'} onClick={pickCard} disabled={pickedCard == -1}>Sélectionner</Button>
        : <Text m={'sm'}>En attente du choix de {props.askerName}</Text>
      }
    </Flex>);
}
