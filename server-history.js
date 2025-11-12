// AurisVoice Backend - History & Export Routes
// Mock endpoints for project history and export functionality

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mock history data
const mockHistory = [
  {
    id: 1,
    file: "voice1.mp3",
    lang: "fr",
    model: "OpenAI TTS",
    provider: "openai",
    date: "2025-11-05",
    duration: "0:12",
    fileUrl: "/output/voice1.mp3"
  },
  {
    id: 2,
    file: "voice2.mp3",
    lang: "en",
    model: "ElevenLabs",
    provider: "elevenlabs",
    date: "2025-11-04",
    duration: "0:09",
    fileUrl: "/output/voice2.mp3"
  },
  {
    id: 3,
    file: "voice3.mp3",
    lang: "es",
    model: "OpenAI TTS",
    provider: "openai",
    date: "2025-11-02",
    duration: "0:15",
    fileUrl: "/output/voice3.mp3"
  },
  {
    id: 4,
    file: "podcast-intro.mp3",
    lang: "de",
    model: "OpenAI TTS",
    provider: "openai",
    date: "2025-11-01",
    duration: "0:20",
    fileUrl: "/output/podcast-intro.mp3"
  },
  {
    id: 5,
    file: "tutorial-video.mp3",
    lang: "it",
    model: "Mock",
    provider: "mock",
    date: "2025-10-30",
    duration: "0:08",
    fileUrl: "/output/tutorial-video.mp3"
  }
];

/**
 * GET /api/history
 * Returns list of all dubbing projects
 * Supports filters: language, provider, date
 */
app.get("/api/history", (req, res) => {
  try {
    const { language, provider, search } = req.query;
    
    let filtered = [...mockHistory];

    // Filter by language
    if (language && language !== 'all') {
      filtered = filtered.filter(p => p.lang === language);
    }

    // Filter by provider
    if (provider && provider !== 'all') {
      filtered = filtered.filter(p => p.provider === provider);
    }

    // Filter by search query
    if (search) {
      const query = search.toString().toLowerCase();
      filtered = filtered.filter(p => 
        p.file.toLowerCase().includes(query)
      );
    }

    console.log(`📋 History requested: ${filtered.length} projects`);

    res.json({
      ok: true,
      projects: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('❌ History error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch history'
    });
  }
});

/**
 * GET /api/export/:id
 * Returns export URL for a project
 */
app.get("/api/export/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'mp3' } = req.query;
    
    const project = mockHistory.find(p => p.id === parseInt(id));
    
    if (!project) {
      return res.status(404).json({
        ok: false,
        error: 'Project not found'
      });
    }

    console.log(`📤 Export requested: ${project.file} as ${format}`);

    // Mock export URL
    const exportUrl = `/output/${project.file.replace('.mp3', `.${format}`)}`;

    res.json({
      ok: true,
      exportUrl: exportUrl,
      format: format,
      filename: project.file.replace('.mp3', `.${format}`),
      size: '2.5 MB'
    });
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({
      ok: false,
      error: 'Export failed'
    });
  }
});

/**
 * GET /api/export/:id/metadata
 * Returns JSON metadata for a project
 */
app.get("/api/export/:id/metadata", (req, res) => {
  try {
    const { id } = req.params;
    
    const project = mockHistory.find(p => p.id === parseInt(id));
    
    if (!project) {
      return res.status(404).json({
        ok: false,
        error: 'Project not found'
      });
    }

    console.log(`📋 Metadata requested: ${project.file}`);

    res.json({
      ok: true,
      metadata: {
        id: project.id,
        file: project.file,
        format: 'mp3',
        language: project.lang,
        provider: project.provider,
        model: project.model,
        duration: project.duration,
        date: project.date,
        url: project.fileUrl,
        generated_by: 'AurisVoice',
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('❌ Metadata error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch metadata'
    });
  }
});

/**
 * Health check
 */
app.get("/status", (req, res) => {
  res.json({ 
    ok: true, 
    message: "AurisVoice History & Export API running 🚀",
    endpoints: {
      history: '/api/history',
      export: '/api/export/:id',
      metadata: '/api/export/:id/metadata'
    }
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ AurisVoice History & Export API running on port ${PORT}`);
  console.log(`📋 History endpoint: /api/history`);
  console.log(`📤 Export endpoint: /api/export/:id`);
  console.log(`📊 Metadata endpoint: /api/export/:id/metadata`);
});
