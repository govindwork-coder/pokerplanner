# 🃏 Poker Planner

Real-time planning poker for agile teams. No account needed.

## Monorepo Structure

```
pokerplanner/
├── client/          # React + Vite frontend  → deploy to Vercel
├── server/          # Express + Socket.io    → deploy to Fly.io
├── package.json     # Root workspace config
├── vercel.json      # Vercel deploy config
└── fly.toml         # Fly.io deploy config
```

---

## Local Development

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Set up environment variables

**Client** — copy `client/.env.example` to `client/.env.local`:
```
VITE_SERVER_URL=http://localhost:3001
```

**Server** — copy `server/.env.example` to `server/.env`:
```
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Run both frontend + backend together
```bash
npm run dev
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:3001

---

## Deploy to Production

### Backend → Fly.io (Free)

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Inside project root, deploy server
cd server
fly launch --name pokerplanner-server --region sin
fly deploy

# 4. Set environment variable
fly secrets set CLIENT_URL=https://your-app.vercel.app
```

Your backend URL will be: `https://pokerplanner-server.fly.dev`

---

### Frontend → Vercel (Free)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from project root
vercel

# 3. Set environment variable in Vercel dashboard:
#    VITE_SERVER_URL = https://pokerplanner-server.fly.dev
```

Or connect your GitHub repo in the Vercel dashboard and it auto-deploys on push.

---

## How It Works

| Role | What they can do |
|------|-----------------|
| **Host** | Create room, add issues, reveal votes, go to next issue |
| **Participant** | Join via link, vote on each issue |

### Card Values
`1 · 2 · 3 · 5 · 8 · 13 · 21 · ? · ☕`

### Socket Events
| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-room` | Client → Server | Join session |
| `add-issue` | Host → Server | Add new issue |
| `vote` | Client → Server | Submit card |
| `reveal-votes` | Host → Server | Reveal all cards |
| `next-issue` | Host → Server | Reset for next issue |
| `room-update` | Server → All | Sync room state |

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router, socket.io-client, react-hot-toast
- **Backend**: Node.js, Express, Socket.io, nanoid
- **Hosting**: Vercel (frontend) + Fly.io (backend)
- **Cost**: $0/month ✅
