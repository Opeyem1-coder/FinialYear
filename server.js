import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());

// Dummy Message model (replace with your actual import)
const Message = mongoose.model("Message", new mongoose.Schema({
  conversationId: String,
  sender: String,
  text: String,
}, { timestamps: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
    const message = await Message.create({
      conversationId,
      sender: senderId,
      text,
    });

    io.to(conversationId).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));

//module.exports = app;
