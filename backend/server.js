const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load Env Variables
dotenv.config();

// Initialize Express
const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse Cookies

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies from frontend
}));

// --- ROUTES ---
// We will uncomment these as we build the controllers next
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));

// --- HEALTH CHECK ---
app.get('/', (req, res) => {
  res.json({ message: 'API is running securely with Supabase ⚡️' });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});