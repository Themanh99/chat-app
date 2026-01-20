
import { Request, Response, NextFunction } from "express";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";
import { HttpCodes } from "../constants/http-codes.js";
import { AppError } from "../utils/AppError.js";
import { ErrorCodes } from "../constants/error-codes.js";
import mongoose from "mongoose";

export const createChannel = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { members } = req.body;
    const userId = req.userId;

    // Basic validation
    if (!members || !Array.isArray(members) || members.length === 0) {
      throw new AppError("Invalid members provided", HttpCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }

    // Identify if it's a DM (2 members) or Group (implied by > 2 or explicit type, for now handle DM logic mainly)
    // The requirement is specific to 1-on-1 chat, so we assume DM if 2 members (including self)
    // If the request only sends the *other* user ID, we append the current user.
    // Let's assume the client sends the OTHER user's ID in an array or single ID, or the full list.
    // Plan says: "Checks if a DM channel already exists between two users"

    // Sanitize members: Valid ObjectIds, unique, include current user
    const memberIds = [...new Set([...members, userId])].filter(id => mongoose.Types.ObjectId.isValid(id));

    if (memberIds.length < 2) {
         throw new AppError("A channel must have at least 2 members", HttpCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }

    // Check for existing DM if it's strictly 2 people
    if (memberIds.length === 2) {
        const existingChannel = await Channel.findOne({
            members: { $all: memberIds, $size: 2 },
            type: "dm"
        }).populate("members", "firstName lastName email image color"); 
        
        if (existingChannel) {
            return res.status(HttpCodes.OK).json({ channel: existingChannel });
        }
    }

    const newChannel = await Channel.create({
        members: memberIds,
        type: memberIds.length > 2 ? "group" : "dm",
        admin: userId, 
        // Group name is required for 'group' type in the schema, handle if needed
        name: memberIds.length > 2 ? "New Group" : undefined 
    });

    await newChannel.populate("members", "firstName lastName email image color");

    return res.status(HttpCodes.CREATED).json({ channel: newChannel });

  } catch (err) {
    next(err);
  }
};

export const getUserChannels = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        
        const channels = await Channel.find({ members: { $in: [userId] } })
            .populate("members", "firstName lastName email image color")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        return res.status(HttpCodes.OK).json({ channels });
    } catch (err) {
        next(err);
    }
};
