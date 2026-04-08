# Hackathon Dashboard Demo

React + TypeScript + Vite hackathon management system with admin and participant dashboards.

## Tech Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite` plugin, `@import "tailwindcss"` in index.css)
- React Router DOM v7
- lucide-react

## Dev

```bash
npm install
npm run dev
```

## Key Architecture

- **Each page wraps its own layout** — not nested routes
- **Score state**: module-level singleton in `src/data/scoreStore.ts` + `useScores` hook
- **TypeScript**: `verbatimModuleSyntax` enabled — always use `import type` for type-only imports
- **Tailwind**: use `sm:` / `lg:` breakpoints for responsive design

## Routes

| Path | Description |
|------|-------------|
| `/admin` | Admin dashboard |
| `/admin/participants` | Participants & teams |
| `/admin/notices` | Notice management (CRUD) |
| `/admin/submissions` | Submission review |
| `/admin/scores` | Scoring board |
| `/admin/score-input` | Score input (via button in `/admin/scores`) |
| `/participant` | Participant dashboard |
| `/participant/timeline` | Milestone timeline |
| `/participant/notices` | Notice list |
| `/participant/submit` | Submission form |
| `/participant/notifications` | Notifications |

## Branch

`claude/setup-react-vite-project-6hmBh`
