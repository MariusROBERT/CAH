import { Socket } from 'socket.io-client';

export type SocketContextType = {
  socket: Socket | undefined,
  updateSocket: (socket: Socket) => void,
  socketSend: (event: string, message: {}) => void,
}
