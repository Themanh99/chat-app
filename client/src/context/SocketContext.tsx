
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import io, { Socket } from "socket.io-client";
import { HOST } from "../lib/constants";

interface SocketContextType {
  socket: Socket | undefined;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { userInfo } = useAuth();
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (userInfo && !socket) {
            const newSocket = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id }
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                setIsConnected(true);
                // Auto join user's personal room for DM notifications
                newSocket.emit("join-user-room", userInfo.id);
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else if (!userInfo && socket) {
            socket.disconnect();
            setSocket(undefined);
            setIsConnected(false);
        }
    }, [userInfo, socket]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
