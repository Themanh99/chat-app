
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "./config/env.js";

let io: SocketIOServer;

export const setupSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
        origin: [env.ORIGIN],
        methods: ["GET", "POST"],
        credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join a specific user room for direct messages
    socket.on("join-user-room", (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        }
    });

    // Join a channel room
    socket.on("join-channel", (channelId) => {
        if (channelId) {
            socket.join(channelId);
            console.log(`Socket ${socket.id} joined channel ${channelId}`);
        }
    });
    
    // Typing indicators
    socket.on("typing", ({ channelId, userId, userName }) => {
        socket.to(channelId).emit("typing", { userId, channelId, userName });
    });

    socket.on("stop-typing", ({ channelId, userId }) => {
        socket.to(channelId).emit("stop-typing", { userId, channelId });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
