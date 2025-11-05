import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/status', (req, res) => {
  res.json({
    ok: true,
    message: 'AurisVoice backend is running 🚀'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎙️  AurisVoice backend running on port ${PORT}`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/status`);
});
