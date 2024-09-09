import { Button, Card, Flex, Text } from '@mantine/core';
import AnswerCard from './AnswerCard.tsx';
import { AnswerCardInterface } from '../Interfaces.ts';
import { useContext, useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameContext } from '../contexts/GameContext.tsx';
import { GameContextType } from '../contexts/@types.game.ts';

interface Props {
  playerNumber: number,
  cards: AnswerCardInterface[][],
  isAsker: boolean | undefined,
  socket: Socket | undefined,
  askerName: string,
  code: string | null,
}

export default function Voting(props: Props) {
  const [pickedCard, setPickedCard] = useState<number>(-1);
  const { game } = useContext(GameContext) as GameContextType;

  function pickCard() {
    props.socket?.emit('vote', { id: props.socket?.id, code: props.code, card: pickedCard });
  }

  return (
    <Flex direction={'column'} className={'voting'} align={'center'}>
      <Card shadow={'sm'} withBorder radius={'lg'}
            w={(((game?.users.length ?? 2) - 1) * (game?.question?.answer ?? 1)) * 160} h={230} pos={'relative'}
            className={'played'}
      >
        <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}>
          {props.isAsker ?
            <Flex justify={'space-between'} h={'100%'} w={'100%'} align={'center'}>
              {
                props.cards.map((item, i) => (
                  <Flex onClick={() => setPickedCard(item[0].id)} direction={'row'} m={'md'}
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
                  <Flex direction={'row'} m={'md'} className={item[0].id === pickedCard ? 'picked' : undefined} key={i}>
                    {item.map((card) => (
                      <AnswerCard text={card.text} key={card.id} />
                    ))}
                  </Flex>
                ))}
            </Flex>
          }
        </Flex>
      </Card>

      {props.isAsker ?
        <Button m={'sm'} onClick={pickCard}>Sélectionner</Button>
        : <Text m={'sm'}>En attente du choix de {props.askerName}</Text>
      }
    </Flex>);
}
