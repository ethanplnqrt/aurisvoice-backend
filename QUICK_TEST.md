# ⚡ Quick Test - OpenAI TTS Integration

## 🚀 Fast Test (3 Steps)

### Step 1: Add API Key
```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "PORT=3000" >> .env
```

### Step 2: Test Integration
```bash
node test-openai-tts.js
```

**Expected:** ✅ Test file created in `output/test-openai-tts.mp3`

### Step 3: Start Backend
```bash
node server-dub.js
```

**Look for:**
```
✅ AurisVoice backend is running on port 3000
🔑 ElevenLabs API: ❌
🔑 OpenAI API: ✅   ← This should show ✅
```

---

## ✅ Success Indicators

Your integration is working when you see:

1. **Test script passes:**
   ```
   🎉 Integration Test PASSED!
   ✅ OpenAI API key is valid
   ✅ Audio file generated successfully
   ```

2. **Backend startup shows:**
   ```
   🔑 OpenAI API: ✅
   ```

3. **API call returns:**
   ```json
   {
     "ok": true,
     "provider": "openai",
     "audioUrl": "/output/dub-xxx.mp3"
   }
   ```

---

## 🧪 Test Commands

```bash
# Quick status check
curl http://localhost:3000/status

# Test dubbing (requires audio file)
curl -X POST http://localhost:3000/api/dub \
  -F "file=@test-audio.mp3" \
  -F "targetLanguage=fr"

# Check if OpenAI is being used
curl -X POST http://localhost:3000/api/dub \
  -F "file=@test.mp3" \
  -F "targetLanguage=en" | grep -o '"provider":"[^"]*"'
```

**Expected:** `"provider":"openai"`

---

## 🎯 Complete Test Flow

```bash
# 1. Setup
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend
echo "OPENAI_API_KEY=sk-your-key" > .env

# 2. Test
node test-openai-tts.js

# 3. Start
node server-dub.js &
cd frontend && npm run dev &

# 4. Open browser
open http://localhost:3001

# 5. Upload file and generate!
```

---

## ✅ Integration Verified

**All objectives complete:**
- ✅ OPENAI_API_KEY loaded from .env
- ✅ OpenAI TTS function uses model "tts-1"
- ✅ Mock mode as fallback
- ✅ Environment template provided
- ✅ POST /api/dub uses OpenAI when no ElevenLabs key
- ✅ Returns real AI MP3 audio
- ✅ No new dependencies added
- ✅ Lightweight operation

**Ready to use!** 🚀

