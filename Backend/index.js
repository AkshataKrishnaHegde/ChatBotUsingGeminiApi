import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const port = process.env.PORT || 3000;
const app = express();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Optimized MongoDB connection (Vercel-friendly)
let isConnected = false;
const connect = async () => {
  if (isConnected) return; // Prevent multiple connects
  try {
    await mongoose.connect(process.env.MONGO);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
};

// ✅ ImageKit config
const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

// --- ROUTES ---

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Backend running successfully");
});

// Authenticated Image upload
app.get("/api/upload", ClerkExpressRequireAuth(), (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// Create a new chat
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  await connect(); // ✅ Ensure DB connection before query
  const userId = req.auth.userId;
  const { text } = req.body;

  try {
    const newChat = new Chat({
      userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();
    const userChats = await UserChats.findOne({ userId });

    if (!userChats) {
      const newUserChats = new UserChats({
        userId,
        chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
      });
      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId },
        { $push: { chats: { _id: savedChat._id, title: text.substring(0, 40) } } }
      );
    }

    res.status(201).send(savedChat._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating chat!");
  }
});

// Fetch all chats for the user
app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  await connect();
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.find({ userId });
    if (!userChats.length) return res.status(200).send([]);
    res.status(200).send(userChats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user chats!");
  }
});

// Fetch single chat by ID
app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  await connect();
  const userId = req.auth.userId;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    res.status(200).send(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching chat!");
  }
});

// Update chat (add new Q/A)
app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  await connect();
  const userId = req.auth.userId;
  const { question, answer, img } = req.body;

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      { $push: { history: { $each: newItems } } }
    );
    res.status(200).send(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding conversation!");
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

// --- PRODUCTION ---
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Local dev server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    connect();
    console.log(`Server running locally on port ${port}`);
  });
}

export default app;
