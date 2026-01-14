
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const userTokenSchema = new Schema<IUserToken>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Automatic deletion of expired tokens
userTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserToken: Model<IUserToken> =
  mongoose.models.UserToken || mongoose.model<IUserToken>("UserToken", userTokenSchema);

export default UserToken;
