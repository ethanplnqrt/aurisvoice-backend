// AurisVoice Backend - Production Minimal
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Root route - Welcome page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AurisVoice API</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 80px auto;
          padding: 20px;
          text-align: center;
        }
        h1 { color: #2563eb; margin-bottom: 10px; }
        p { color: #64748b; font-size: 18px; }
        .endpoint { 
          background: #f1f5f9; 
          padding: 15px; 
          border-radius: 8px; 
          margin: 20px 0;
          text-align: left;
        }
        code { color: #0f172a; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>🎙️ AurisVoice Backend</h1>
      <p>Premium AI Voice Dubbing API</p>
      <div class="endpoint">
        <strong>Health Check:</strong><br>
        <code>GET /status</code> → Returns server status
      </div>
    </body>
    </html>
  `);
});

// Status endpoint - Health check
app.get("/status", (req, res) => {
  res.json({ ok: true, message: "AurisVoice backend is running 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ AurisVoice backend is running on port ${PORT}`);
});
