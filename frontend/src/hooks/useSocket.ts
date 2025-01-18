// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socketUrl = 'http://localhost:3000'; 
interface Chat {
    id?: string;
    timestamp: string;
    message: string;
    from_id: string;
    to_id: string;
}

export const useSocket = (userId: string, targetId: string, setRecentChats: React.Dispatch<React.SetStateAction<{ [key: string]: Chat }>>) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [chatHistory, setChatHistory] = useState<Chat[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ["websocket"],
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log("Socket connected:", newSocket.id);  // Confirm connection
        });

        // Join room when the user connects
        newSocket.emit('joinRoom', { userId });

        newSocket.on('receiveMessage', (message: any) => {
            console.log("message received", message.message)
            if(message.from_id === targetId)  setChatHistory(prevHistory => [...prevHistory, message]);
            setRecentChats((prevChats: { [key: string]: Chat }) => {
                const updatedChats = { ...prevChats };
                updatedChats[message.from_id === userId ? message.to_id : message.from_id] = message;
                return updatedChats;
            });
        })

        newSocket.on('userTyping', ({ fromId }: { fromId: string }) => {
            if (fromId === targetId) {
                setIsTyping(true);
            }
        });

        newSocket.on('userStopTyping', ({ fromId }: { fromId: string }) => {
            if (fromId === targetId) {
                setIsTyping(false);
            }
        });

        newSocket.on('error', (errorMsg: string) => {
            setError(errorMsg);
        });

        // Cleanup socket connection
        return () => {
            newSocket.disconnect();
        };
    }, [userId, targetId]);

    const sendMessage = () => {
        if (message.trim()) {
            socket?.emit('sendMessage', { fromId: userId, toId: targetId, message });
            socket?.emit('stopTyping', { fromId: userId, toId: targetId });
            const newMessage: Chat = { from_id: userId, to_id: targetId, message, timestamp: new Date().toString()};
            setChatHistory(prevHistory => [...prevHistory, newMessage]);
            setRecentChats((prevChats: { [key: string]: Chat }) => ({
                ...prevChats,
                [newMessage.to_id]: newMessage,
            }));
            setMessage('');
        }
    };

    const handleTyping = () => {
        if (typingTimeout) clearTimeout(typingTimeout);

        socket?.emit('typing', { fromId: userId, toId: targetId });

        const timeout = setTimeout(() => {
            socket?.emit('stopTyping', { fromId: userId, toId: targetId });
        }, 2000); 

        setTypingTimeout(timeout);
    };
    return {
        chatHistory,
        error,
        message,
        setMessage,
        sendMessage,
        setChatHistory,
        isTyping,
        handleTyping
    };
};
