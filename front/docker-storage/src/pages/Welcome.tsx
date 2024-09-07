import { Button, Center, Fieldset, Flex, PinInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import '@mantine/notifications/styles.css';
import io, { Socket } from 'socket.io-client';
import { notifications } from '@mantine/notifications';

export default function Welcome() {
  const [code, setCode] = useState<string>('');

  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);
  }, [setSocket]);

  function createListener(code: string) {
    console.log(code);
    window.location.href = '/game?code=' + code;
  }

  function handleErrors(message: string) {
    console.error(message);
    if (message === 'too many tries')
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'An error occurred while creating the game, please retry later',
      });
    else if (message === 'not found') {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Game ${code} not found`,
      });
      setCode('');
    }
  }

  function createGame() {
    socket?.emit('create', { id: socket?.id });
  }

  function joinGame() {
    if (code.length == 6)
      socket?.emit('checkGame', { id: socket?.id, code });
  }

  function joinListener() {
    location.href = '/game?code=' + code;
  }

  useEffect(() => {
    socket?.on('error', handleErrors);
    socket?.on('create', createListener);
    socket?.on('join', joinListener);
    return () => {
      socket?.off('error', handleErrors);
      socket?.off('create', createListener);
      socket?.off('join', joinListener);
    };
  }, [createListener, handleErrors]);


  return (
    <Center>
      <Flex justify={'space-evenly'}
            align={'center'}
            gap={{ base: 0, sm: 'xl' }}
            m={{ base: 'xs', sm: 'xl' }}
            direction={{ base: 'column', sm: 'row' }}>
        <Flex direction={'column'}>
          <Title mb={{ base: 'xs', sm: 'xl' }} p={{ base: 'xs', sm: 'xl' }}>
            Bienvenue sur mon jeu de <br /> Cartes contre l'Humanité
          </Title>
          <Button style={{ visibility: 'hidden' }} />
        </Flex>
        <Flex direction="column" align={'center'}>
          <Fieldset radius={'md'}>
            <Title m={'md'}> Rejoindre </Title>
            <PinInput length={6} mb={'md'} placeholder={''} value={code} onChange={setCode} />
            <Button variant={'light'} onClick={joinGame}>Valider</Button>
          </Fieldset>
          <Flex m={'md'}>
            <Button onClick={createGame}>Créer votre partie</Button>
          </Flex>
        </Flex>
      </Flex>
    </Center>
  );
}
