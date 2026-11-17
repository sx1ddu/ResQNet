import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/axiosClient.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export function SocketProvider({ children }) {
  const { user, accessToken, loading } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (loading || !user || !accessToken) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      auth: { token: accessToken },
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => setConnected(true));
    socketInstance.on('disconnect', () => setConnected(false));
    socketInstance.connect();

    return () => {
      socketInstance.disconnect();
    };
  }, [user, accessToken, loading]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}
