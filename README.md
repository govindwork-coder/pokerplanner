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

### Backend → Render (Free)

```bash
# 1. Install Render CLI
brew tap render-oss/render && brew install render

# 2. Login
render login

# 3. Set workspace
render workspace set <your-workspace-id>

# 4. Deploy via Render API (render.yaml already included)
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer <your-render-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "pokerplanner-server",
    "ownerId": "<your-workspace-id>",
    "repo": "https://github.com/<your-username>/pokerplanner",
    "branch": "main",
    "rootDir": "server",
    "serviceDetails": {
      "runtime": "node",
      "buildCommand": "npm install",
      "startCommand": "node src/index.js",
      "plan": "free",
      "region": "singapore",
      "envSpecificDetails": {
        "buildCommand": "npm install",
        "startCommand": "node src/index.js"
      }
    },
    "envVars": [
      { "key": "NODE_ENV", "value": "production" },
      { "key": "CLIENT_URL", "value": "https://your-app.vercel.app" }
    ]
  }'
```

Your backend URL will be: `https://pokerplanner-server.onrender.com`

> **Note:** Render's free tier spins down after 15 min of inactivity. The first connection after idle may take ~30 seconds to wake up.

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
