import './App.css';
import '@mantine/core/styles.css';
import Game from './pages/Game.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Center, MantineProvider } from '@mantine/core';
import Welcome from './pages/Welcome.tsx';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import GameProvider from './contexts/GameContext.tsx';
import SocketProvider from './contexts/SocketContext.tsx';

export default function App() {
  return (
    <MantineProvider>
      <GameProvider>
        <SocketProvider>
          <Center h={'100vh'} p={0} m={0}>
            <Notifications />
            <ModalsProvider>
              <BrowserRouter>
                <Routes>
                  <Route path={'/game/*'} element={<Game />} />
                  <Route path={'*'} element={<Welcome />} />
                </Routes>
              </BrowserRouter>
            </ModalsProvider>
          </Center>
        </SocketProvider>
      </GameProvider>
    </MantineProvider>
  );
}
