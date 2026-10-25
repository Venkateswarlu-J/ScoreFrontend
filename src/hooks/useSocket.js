import { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { SocketContext } from '../context/SocketContext.jsx';

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
