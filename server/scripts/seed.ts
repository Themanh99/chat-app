
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { connectDB } from "../helpers/common-helper.js";
import User from "../models/UserModel.js";
import Channel from "../models/ChannelModel.js";
import Message from "../models/MessageModel.js";
import { env } from "../config/env.js"; // Ensure env is loaded

const SEED_COUNTS = {
  USERS: 10,
  CHANNELS_GROUP: 3,
  CHANNELS_DM: 5,
  MESSAGES_PER_CHANNEL: 20,
};

async function seed() {
  await connectDB();

  console.log("🌱 Starting Database Seed...");
  console.log("⚠️  Clearing existing data...");
  await User.deleteMany({});
  await Channel.deleteMany({});
  await Message.deleteMany({});

  // 1. Create Users
  console.log(`Creating ${SEED_COUNTS.USERS} users...`);
  const users = [];
  const password = "password123"; // Common password for testing

  for (let i = 0; i < SEED_COUNTS.USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await User.create({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      pass: password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      image: faker.image.avatar(),
      color: faker.number.int({ min: 0, max: 5 }), // Assuming 6 colors
      profileSetup: true,
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users.`);

  // 2. Create Channels (Groups)
  console.log(`Creating ${SEED_COUNTS.CHANNELS_GROUP} group channels...`);
  const channels = [];

  for (let i = 0; i < SEED_COUNTS.CHANNELS_GROUP; i++) {
    const admin = users[0]; // First user is admin
    const members = users.slice(0, 5).map((u) => u._id); // First 5 users

    const channel = await Channel.create({
      name: faker.commerce.department() + " Team",
      type: "group",
      admin: admin._id,
      members,
    });
    channels.push(channel);
  }

  // 3. Create Channels (DMs)
  console.log(`Creating ${SEED_COUNTS.CHANNELS_DM} DM channels...`);
  for (let i = 0; i < SEED_COUNTS.CHANNELS_DM; i++) {
    const user1 = users[i];
    const user2 = users[i + 1] || users[0];

    const channel = await Channel.create({
      type: "dm",
      members: [user1._id, user2._id],
    });
    channels.push(channel);
  }
  
  // 4. Create Messages
  console.log(`Creating messages...`);
  for (const channel of channels) {
    for (let i = 0; i < SEED_COUNTS.MESSAGES_PER_CHANNEL; i++) {
        const sender = channel.members[Math.floor(Math.random() * channel.members.length)];
        const content = faker.lorem.sentence();
        
        await Message.create({
            sender,
            channelId: channel._id,
            content,
            messageType: "text",
        });
    }

    // Update lastMessage for channel (roughly)
    const lastMsg = await Message.findOne({ channelId: channel._id }).sort({ createdAt: -1 });
    if (lastMsg) {
        channel.lastMessage = lastMsg._id as mongoose.Types.ObjectId;
        await channel.save();
    }
  }

  console.log("✅ Seeding complete!");
  console.log("LOGIN CREDENTIALS:");
  console.log(`Email: ${users[0].email}`);
  console.log(`Password: ${password}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
