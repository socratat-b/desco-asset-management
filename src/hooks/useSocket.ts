import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  userId?: string;
  enabled?: boolean;
}

export const useSocket = ({ userId, enabled = true }: UseSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Initialize socket connection - use custom server (not API route)
    const socketUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      : 'http://localhost:3000';

    console.log('Initializing socket connection to:', socketUrl);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      upgrade: true,
      rememberUpgrade: false, // Don't remember upgrade to avoid connection issues
      timeout: 20000, // 20 second timeout
      forceNew: true, // Force new connection
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 5, // Try 5 times
      reconnectionDelay: 1000, // Wait 1 second between attempts
      // Don't specify path since we're using the integrated server (not API route)
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Authenticate user if userId is provided
      if (userId) {
        socket.emit('user:authenticate', userId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      
      // Re-authenticate user if userId is provided
      if (userId) {
        socket.emit('user:authenticate', userId);
      }
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed - giving up');
      setConnectionError('Connection failed after multiple attempts');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, enabled]);

  // Helper functions for common socket operations
  const emit = (event: string, ...args: any[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
    } else {
      console.warn(`Cannot emit ${event}: socket not connected`);
    }
  };

  const on = (event: string, listener: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, listener);
    }
  };

  const off = (event: string, listener?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, listener);
    }
  };

  const joinRoom = (roomId: string) => {
    emit('room:join', roomId);
  };

  const leaveRoom = (roomId: string) => {
    emit('room:leave', roomId);
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
};