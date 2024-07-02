const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userGameRoutes = require('./routes/userGameRoutes');
const multGameRoutes = require('./routes/multGameRoutes');
const multGameplayRoutes = require('./routes/multGameplayRoutes');

// Import the socket manager
const socketManager = require('./socketManager');

const app = express();
// web socket setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});

// ... (after creating 'io')
socketManager(io);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user/game', userGameRoutes);
app.use('/api/mult/game', multGameRoutes);
app.use('/api/mult/gameplay', multGameplayRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));