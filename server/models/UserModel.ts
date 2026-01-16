
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  pass: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  color?: number;
  profileSetup?: boolean;
  theme?: string;
  notifications?: boolean;
  activeStatus?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    pass: {
      type: String,
      required: [true, "Password is required"],
    },
    firstName: { type: String, required: false, default: "" },
    lastName: { type: String, required: false, default: "" },
    image: { type: String, required: false, default: "" },
    color: { type: Number, required: false, default: 0 },
    profileSetup: { type: Boolean, required: false, default: false },
    theme: { type: String, required: false, default: "light" },
    notifications: { type: Boolean, required: false, default: true },
    activeStatus: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("pass")) return next();
  try {
    const rounds = 10; // Default or from env
    const salt = await bcrypt.genSalt(rounds);
    this.pass = await bcrypt.hash(this.pass, salt);
    return next();
  } catch (err) {
    return next(err as any);
  }
});

// Helper to compare password
userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.pass);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
