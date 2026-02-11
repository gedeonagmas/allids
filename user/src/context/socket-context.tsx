"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (user) {
            const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const token = document.cookie.split('socket_token=')[1]?.split(';')[0];

            const newSocket = io(`${socketUrl}/notifications`, {
                auth: { token },
                withCredentials: true,
                transports: ['polling', 'websocket'], // Allow polling fallback
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
                console.log('Socket connected');
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
                console.log('Socket disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            setSocket(null);
            setIsConnected(false);
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
