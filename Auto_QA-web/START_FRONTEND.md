# 🚀 Start Frontend - Quick Guide

## Start the Frontend Server

```bash
cd Auto_QA-web
npm run dev
```

The frontend will start on: **http://localhost:3000**

---

## ✅ What You'll See

```
  ▲ Next.js 15.5.3
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

---

## 🌐 Open in Browser

Visit any of these URLs:

- **Login:** http://localhost:3000/login
- **Register:** http://localhost:3000/register
- **Dashboard:** http://localhost:3000/dashboard
- **Quick Launch:** http://localhost:3000/dashboard/quick-launch

---

## 📋 Make Sure Backend is Running

The frontend needs the backend API to work!

```bash
# In another terminal
cd Auto_QA-backend
npm run dev
```

Backend should be running on: **http://localhost:3001**

---

## 🛠️ Available Scripts

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## ✅ Quick Test

1. Start backend: `cd Auto_QA-backend && npm run dev`
2. Start frontend: `cd Auto_QA-web && npm run dev`
3. Open: http://localhost:3000/login
4. Try logging in or registering!

---

## 🔍 Troubleshooting

### Port 3000 already in use?
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

### Module not found errors?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to backend?
- Check backend is running on http://localhost:3001
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001`

---

**Ready to go!** 🎉


