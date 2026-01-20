
import { Request, Response, NextFunction } from "express";
import Message from "../models/MessageModel.js";
import Channel from "../models/ChannelModel.js";
import { getIO } from "../socket.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/files";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    if (!channelId) {
         return res.status(400).send("Channel ID is required.");
    }

    const messages = await Message.find({ channelId })
      .populate("sender", "id firstName lastName email image color")
      .sort({ createdAt: 1 }); // Sort by time, oldest first

    return res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { channelId, content, messageType, fileUrl } = req.body;
    // @ts-ignore
    const senderId = req.userId;

    if (!channelId || (!content && !fileUrl)) {
      return res.status(400).send("Channel ID and content/file are required.");
    }
    
    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if(!channel) {
        return res.status(404).send("Channel not found");
    }

    const newMessage = await Message.create({
      sender: senderId,
      channelId,
      content,
      messageType,
      fileUrl,
      createdAt: new Date(),
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "id firstName lastName email image color"
    );

    // Emit socket event to channel
    const io = getIO();
    const roomId = channelId.toString(); // Ensure it's a string
    console.log(`Emitting receive-message to room: ${roomId}`);
    
    // Also emit to individual members for DM notifications
    if (channel.type === "dm" && channel.members) {
        for (const memberId of channel.members) {
            const memberIdStr = memberId.toString();
            console.log(`Also emitting to user room: ${memberIdStr}`);
            io.to(memberIdStr).emit("receive-message", { ...populatedMessage?.toObject(), channelId: roomId });
        }
    }
    
    io.to(roomId).emit("receive-message", { ...populatedMessage?.toObject(), channelId: roomId });
    
    // Update last message in channel
    await Channel.findByIdAndUpdate(channelId, { lastMessage: newMessage._id, updatedAt: new Date() });

    return res.status(201).json({ message: populatedMessage });
  } catch (err) {
    next(err);
  }
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const fileUrl = `uploads/files/${req.file.filename}`;
    return res.status(200).json({ fileUrl });
  } catch (err) {
    next(err);
  }
};
