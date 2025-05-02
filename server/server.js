import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meetfit');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import chatbotRoutes from './routes/chatbot.js';
import path from 'path';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Serve static files
const staticPath = process.env.NODE_ENV === 'production' ? path.join(process.cwd(), 'client', 'dist') : path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(staticPath));

// Serve client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client', 'dist', 'index.html'));
  });
}

// Socket.io event handlers for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room (based on activity ID)
  socket.on('join_chat', (activityId) => {
    socket.join(activityId);
    console.log(`User ${socket.id} joined chat for activity: ${activityId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (activityId) => {
    socket.leave(activityId);
    console.log(`User ${socket.id} left chat for activity: ${activityId}`);
  });

  // Send a message to a chat room
  socket.on('send_message', (data) => {
    // Broadcast to all users in the room except sender
    socket.to(data.activityId).emit('receive_message', data);
  });

  // User is typing indicator
  socket.on('typing', (data) => {
    socket.to(data.activityId).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});