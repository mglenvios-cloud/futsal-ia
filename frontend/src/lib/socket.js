'use client';

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }
  return socket;
};

export const subscribeToLiveMatches = (callback) => {
  const s = getSocket();
  s.emit('subscribe:live');
  s.on('live:matches', (data) => callback(data));
  return () => s.off('live:matches');
};

export const subscribeToMatch = (matchId, callback) => {
  const s = getSocket();
  s.emit('subscribe:match', matchId);
  s.on('match:update', (data) => callback(data));
  return () => {
    s.emit('unsubscribe:match', matchId);
    s.off('match:update');
  };
};

export const subscribeToNotifications = (callback) => {
  const s = getSocket();
  s.on('notification', (data) => callback(data));
  return () => s.off('notification');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
