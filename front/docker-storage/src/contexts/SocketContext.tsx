import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { SocketContextType } from './@types.socket.ts';

export const SocketContext = React.createContext<SocketContextType | undefined>(undefined);

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);
  }, [setSocket]);

  function updateSocket(newSocket: Socket) {
    setSocket(newSocket);
  }

  function socketSend(event: string, message: {} = {}) {
    console.log('event: ' + event);
    console.log({ id: socket?.id, ...message });
    socket?.emit(event, { id: socket?.id, ...message });
  }

  return (
    <SocketContext.Provider value={{ socket, updateSocket, socketSend }}>
      {children}
    </SocketContext.Provider>
  );
}
