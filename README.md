# FlippersClub - Multiplayer Memory Game

A modern, responsive, real-time multiplayer card matching game. No database required!

## Features
- **Stateless Multiplayer**: No accounts needed. Just pick a name and play.
- **5 Progressive Levels**: Increasing difficulty with more cards.
- **In-game Chat**: Battle your rival in real-time.
- **Modern UI**: Dark theme, glassmorphism, and silky animations.

## How to Run Locally

### 1. Server
```bash
cd server
node index.js
```

### 2. Client
```bash
cd client
npm run dev
```

## How to Deploy (FREE Forever)

### Backend (Server)
- Use **Render.com**. 
- Create a "Web Service".
- Point it to the `server/` folder.
- Set the `CLIENT_URL` environment variable if needed.

### Frontend (Client)
- Use **Vercel** or **Netlify**.
- Connect your GitHub.
- Select the `client` folder.
- It will give you a public link to share with your friend!

**No database setup required!** Just deploy and play.
