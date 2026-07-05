# 🌱 EcoLoop

A daily eco-habit tracker with AI-validated custom habits, a GitHub-style contribution
heatmap, real CO₂-saved math, and personalized nudges — built as a full-stack portfolio piece.

Sign in with Google, check off a few eco-friendly things you did today (walked instead of
drove, ate plant-based, air-dried laundry…), and watch your streak, CO₂ total, and "growth
grid" heatmap update live. Add your own habits — Gemini checks they're genuinely eco-related
before they count.

## Tech stack

**Frontend** — Angular 18 (standalone components, signals), Angular Animations API only (no
GSAP/Framer Motion), hand-written SCSS design tokens, glassmorphism UI.

**Backend** — Node.js + Express, MongoDB + Mongoose, Passport.js (Google OAuth 2.0, JWT
sessions via httpOnly cookie), Google Gemini API (free tier) for habit validation and nudges.

## Features

- 🔐 **Google Sign-In only** — no passwords, JWT session via httpOnly cookie
- 🔥 **Streak tracking** — current + longest streak, computed server-side
- 🍃 **Contribution heatmap** — a GitHub-style year view with an asymmetric "leaf" cell shape
  as a small signature visual motif, hover tooltips, month labels
- 🌍 **Real CO₂ math** — every logged habit has a kg-CO₂-saved estimate; totals update live
- 🤖 **AI-validated custom habits** — type any habit, Gemini decides if it's genuinely
  eco-related and estimates its CO₂ impact, or rejects it with a friendly rephrase suggestion
- 💬 **Personalized nudges** — a short Gemini-generated line based on your actual streak/CO₂
  numbers, not a generic quote
- 📊 **Stats & history** — weekly completion chart, top-habit breakdown, monthly calendar view
- 🎉 **Milestone celebrations** — a lightweight CSS confetti burst at 7-day and 30-day streaks
- 📱 Fully responsive, light-mode-only Apple-style glassmorphism

## Project structure

```
EcoLoop/
├── client/     Angular frontend
├── server/     Express + MongoDB API
└── SETUP.md    Full setup, architecture, and deployment guide
```

## Quick start

```bash
# Backend
cd server
cp .env.example .env   # fill in MongoDB URI, Google OAuth creds, JWT secret, Gemini API key
npm install
node src/utils/seedHabits.js
npm run dev

# Frontend (new terminal)
cd client
npm install
npm start
```

Visit `http://localhost:4200`. See **[SETUP.md](./SETUP.md)** for:
- the full architecture breakdown and API route table
- where to get Google OAuth credentials and a free Gemini API key
- step-by-step deployment to Vercel (frontend), Render (backend), and MongoDB Atlas

## Design notes

Palette: deep emerald canopy green, warm off-white, a bright "sprout" green for
highlights/milestones. Type: `Fraunces` (serif, for headings) paired with `Plus Jakarta Sans`
(body) and `JetBrains Mono` (numbers) — chosen deliberately over an all-sans-default look.
Every number on the dashboard (streak, CO₂, today's count) animates with an eased count-up;
the heatmap cells use a asymmetric leaf-shaped border-radius instead of plain squares as a
consistent, understated nod to the eco theme.

## License

Personal portfolio project — feel free to fork for your own learning/portfolio use.
