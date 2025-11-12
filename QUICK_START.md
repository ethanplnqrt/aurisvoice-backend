# 🚀 AurisVoice - Quick Start Guide

## ⚡ Get Started in 5 Minutes

---

## 📦 What You Need

- Node.js 18+ installed
- OpenAI API key (get from https://platform.openai.com)
- Terminal/Command Line
- Code editor (optional)

---

## 🔧 Local Development

### 1️⃣ Backend Setup (2 minutes)

```bash
# Navigate to backend
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend

# Install dependencies
npm install

# Create .env file
echo "PORT=3000" > .env
echo "OPENAI_API_KEY=your-key-here" >> .env
echo "OPENAI_MIN_CREDIT=1.0" >> .env

# Start backend
node server-dub.js
```

**Expected output:**
```
✅ AurisVoice backend is running on port 3000
🔑 OpenAI API: ✅
🧭 Credit monitor active
```

### 2️⃣ Frontend Setup (2 minutes)

**Open new terminal:**

```bash
# Navigate to frontend
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend/frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_APP_NAME=AurisVoice" >> .env.local

# Start frontend
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3001
```

### 3️⃣ Open & Test (1 minute)

**Visit:** http://localhost:3001

**Test:**
1. Scroll to upload section
2. Upload audio file (< 10MB)
3. Select language
4. Click "Generate Dub"
5. Wait ~5-10 seconds
6. Play generated audio

✅ **You're running AurisVoice locally!**

---

## 🌐 Production Deployment

### Option A: Render + Vercel (Recommended)

**Backend → Render:**
1. Push code to GitHub
2. Create Render account
3. New Web Service → Connect repo
4. Set environment variables
5. Deploy

**Frontend → Vercel:**
1. Create Vercel account
2. New Project → Import repo
3. Set environment variables
4. Deploy

**Full guide:** See `DEPLOYMENT_GUIDE.md`

### Option B: Docker (Advanced)

```bash
# Coming soon
docker-compose up -d
```

---

## 📚 Documentation

- **Full README:** `README.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`
- **Phase 3.7:** `PHASE_3_7_COMPLETE.md`
- **Final Summary:** `FINAL_PROJECT_SUMMARY.md`

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=3000
OPENAI_API_KEY=sk-your-key
OPENAI_MIN_CREDIT=1.0
CORS_ORIGIN=*
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AurisVoice
```

---

## 🧪 Test Endpoints

```bash
# Health check
curl http://localhost:3000/status

# Credit balance
curl http://localhost:3000/api/credit

# OpenAI verification
curl http://localhost:3000/verify-openai
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 node server-dub.js
```

### OpenAI API Error
- Check API key is valid
- Check account has credits
- Check key has TTS permissions

### CORS Error
- Ensure backend is running
- Check NEXT_PUBLIC_API_URL is correct
- Try CORS_ORIGIN=* in .env

---

## 🎯 Next Steps

1. ✅ Test all features
2. Customize branding
3. Deploy to production
4. Setup custom domain
5. Launch! 🚀

---

## 💬 Need Help?

- **Documentation:** `/docs` folder
- **Issues:** GitHub Issues
- **Community:** Discord (coming soon)

---

**🎙️ Happy Dubbing with AurisVoice! ✨**

