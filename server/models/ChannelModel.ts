
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChannel extends Document {
  name?: string;
  type: "dm" | "group";
  members: mongoose.Types.ObjectId[];
  admin?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: function (this: IChannel) {
        return this.type === "group";
      },
    },
    type: {
      type: String,
      enum: ["dm", "group"],
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IChannel) {
        return this.type === "group";
      },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Channel: Model<IChannel> =
  mongoose.models.Channel || mongoose.model<IChannel>("Channel", channelSchema);

export default Channel;
