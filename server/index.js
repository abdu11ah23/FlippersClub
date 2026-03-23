const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const initGameSocket = require('./socket/game');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io
initGameSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`FlippersClub Server running on port ${PORT}`);
});
