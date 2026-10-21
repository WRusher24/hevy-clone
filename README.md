# Hevy Clone — Workout Tracker

A complete, Hevy-style strength training tracker built with React + TypeScript. Log workouts set by
set, build reusable routines, browse an exercise library with personal records, and follow a feed of
finished sessions.

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/TypeScript-4.9-3178c6) ![stack](https://img.shields.io/badge/Chakra_UI-2-319795)

## Features

- **Exercise library** — ~100 seeded movements with search across name/muscle/equipment, muscle and
  equipment filters, custom exercise creation, per-exercise best set and a top-set trend chart.
- **Workout logging** — live stopwatch, editable sets (weight / reps / done), add or remove sets and
  exercises, per-exercise notes, and a rest timer with +15s and skip.
- **Routines** — build routines with target sets, rep ranges, rest and notes; reorder exercises;
  duplicate, rename, delete; organise them into folders; start a workout from any routine.
- **History** — monthly grouped workout list, all-time volume, 8-week volume chart, streak, and a
  full workout detail page with PR badges, repeat, share and delete.
- **Feed** — finished workouts published to the feed with likes, comments, share links and delete.
- **Profile & settings** — name, handle, bio, kg/lb unit, bodyweight, weekly goal, PR table,
  30-day volume by muscle, JSON export and demo-data reset.
- **Offline-first** — everything persists to `localStorage`; no backend or credentials required.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 18, Chakra UI 2, Emotion, custom CSS design tokens |
| Language | TypeScript (strict) |
| Routing | React Router 6 |
| State | React context + reducer-style actions, persisted to `localStorage` |
| Build | Create React App (`react-scripts` 5) |
| Hosting | Vercel (static build + SPA rewrites) |

## Project structure

```
hevy-clone/
├─ frontend/                  # the app
│  ├─ public/                 # index.html, manifest, icons
│  ├─ src/
│  │  ├─ components/          # reusable UI (cards, pickers, timer, dialogs)
│  │  ├─ context/AppContext.tsx   # single source of truth + all actions
│  │  ├─ lib/                 # storage, seed data, stats, formatting, clipboard
│  │  ├─ pages/               # one file per route
│  │  ├─ App.tsx              # routes
│  │  ├─ theme.ts             # Chakra theme (dark)
│  │  └─ config.ts            # process.env driven configuration
│  ├─ .env.example            # documented environment variables
│  └─ vercel.json             # config used when Root Directory = frontend
└─ vercel.json                # config used when Root Directory = repo root
```

## Getting started

```bash
cd frontend
npm install
npm start          # http://localhost:3000
```

Production build and checks:

```bash
npm run typecheck  # tsc --noEmit
npm run build      # optimized build in frontend/build
npm test           # smoke tests
```

## Environment variables

All variables are optional — the app boots with sane defaults and no secrets. Copy the example file
to start overriding them:

```bash
cd frontend
cp .env.example .env.local
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `REACT_APP_APP_NAME` | `Hevy Clone` | Name shown in the navbar |
| `REACT_APP_API_BASE_URL` | _(empty)_ | Optional REST backend; empty = offline mode |
| `REACT_APP_STORAGE_KEY` | `hevy-clone` | `localStorage` namespace |
| `REACT_APP_SEED_DEMO_DATA` | `true` | Seed demo workouts on first load (`false` for an empty account) |
| `REACT_APP_PUBLIC_BASE_URL` | _(empty)_ | Origin used for copied share links |

Only `REACT_APP_*` variables are inlined by Create React App. Never put private keys in them — they
ship to the browser. Anything secret belongs behind a serverless function.

## Deploying to Vercel

The repository contains two `vercel.json` files so either import mode works.

**Option A — Root Directory = repository root (recommended)**

1. Go to [vercel.com/new](https://vercel.com/new) and import `hevy-clone`.
2. Leave **Root Directory** as `./` (the default).
3. Framework preset: **Create React App** (auto-detected). Build and output settings are read from
   the root `vercel.json` (`cd frontend && npm run build`, output `frontend/build`).
4. Add environment variables if needed, then **Deploy**.

**Option B — Root Directory = `frontend`**

Set Root Directory to `frontend` and keep the detected CRA preset; `frontend/vercel.json` supplies
the build command, output directory and SPA rewrites.

**Option C — CLI**

```bash
npm i -g vercel
vercel login
vercel --prod          # run from the repository root
```

Both configs rewrite every unknown path to `/index.html`, so deep links such as
`/routines/abc123` or `/workout/xyz` work on refresh.

## Git: stage, commit and push

```bash
# from the repository root
git status
git add -A
git commit -m "feat: complete workout tracker app, fix build, add Vercel config"
git push origin main
```

If `origin` is not your fork yet:

```bash
git remote -v
git remote set-url origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Vercel redeploys automatically on every push to the connected branch.

## Data model

`Workout` → `WorkoutExercise[]` → `WorkoutSet[]`. Weights are stored in the unit used when the
workout was logged (`Workout.unit`), so switching kg/lb never rewrites history. `Routine` mirrors the
same shape with target sets and rep ranges instead of logged values.

All mutations live in `frontend/src/context/AppContext.tsx`; swap the `lib/storage.ts` repository for
HTTP calls to `REACT_APP_API_BASE_URL` to move to a real backend without touching the UI.
