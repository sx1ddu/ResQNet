// -----------------------------------------------------------------------------
// socketService.js — thin wrapper around Socket.IO so controllers can emit
// real-time events without importing `io` everywhere directly.
//
// Pattern: initSocket(server) is called once in server.js. It stores the io
// instance in module scope, and getIO() lets any controller broadcast an
// event, e.g.  getIO().emit('incident:new', incident)
// -----------------------------------------------------------------------------

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('_id role');
      if (!user) return next(new Error('Authentication required'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO was requested before initSocket() was called');
  }
  return io;
}

module.exports = { initSocket, getIO };
