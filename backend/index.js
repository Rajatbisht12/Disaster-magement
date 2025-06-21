const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Logger setup
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.json(),
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
});
app.use(limiter);

// Import routes
app.use('/disasters', require('./routes/disasters'));
app.use('/geocode', require('./routes/geocode'));

// Socket.IO setup
io.on('connection', (socket) => {
  logger.info('Socket connected', { id: socket.id });
  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { id: socket.id });
  });
});

// Make io available globally
global.io = io;

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Export for testing or other modules
module.exports = { app, server, io }; 