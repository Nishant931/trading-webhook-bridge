import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('new_signal', (data) => {
      setSignals((prev) => [data, ...prev]);
    });

    socketInstance.on('trade_executed', (data) => {
      setSignals((prev) => [data, ...prev]);
    });

    socketInstance.on('trade_update', (data) => {
      setSignals((prev) => [data, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected, signals };
}
