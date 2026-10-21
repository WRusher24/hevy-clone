# Hevy Clone — frontend

React + TypeScript + Chakra UI workout tracker. See the [root README](../README.md) for features,
environment variables and deployment instructions.

```bash
npm install
npm start        # http://localhost:3000
npm run build    # production build in ./build
npm run typecheck
npm test
```

Environment variables live in `.env.local` (copy `.env.example`). The app is offline-first: all data
is stored in `localStorage` under the `REACT_APP_STORAGE_KEY` namespace until a backend is wired up
through `REACT_APP_API_BASE_URL`.
