// -----------------------------------------------------------------------------
// server.js — application entry point. Wires together Express (REST API),
// Socket.IO (real-time events) on one shared HTTP server, and MongoDB.
// -----------------------------------------------------------------------------

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const alertRoutes = require('./routes/alertRoutes');

connectDB();

const app = express();
// Render/Railway sit behind one trusted reverse proxy; use the forwarded
// client address so the API and login rate limits apply per visitor.
app.set('trust proxy', 1);

// --- Core middleware ---------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' })); // 5mb allows base64 image payloads for demo uploads
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Basic protection against brute-force login attempts / API abuse on a
// free-tier deployment (Render/Railway) with no other WAF in front of it.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Health check (used by Render/Railway to know the service is alive) --
// Make the service's base deployment URL useful when opened directly.
app.get('/', (req, res) => {
  res.json({ success: true, message: 'ResQNet API is running', health: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ResQNet API is running', demoMode: process.env.DEMO_MODE === 'true' });
});

// --- Feature routes ------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);

// --- Error handling (must be last) ---------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- HTTP + Socket.IO share the same server so they can share one port ---
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`[server] ResQNet API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = { app, httpServer };
