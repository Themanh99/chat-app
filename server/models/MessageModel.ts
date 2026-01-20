
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "audio" | "video" | "file";
  fileUrl?: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    content: {
      type: String,
      required: function (this: IMessage) {
        return this.messageType === "text";
      },
    },
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "video", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      required: function (this: IMessage) {
        return this.messageType !== "text";
      },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
