# AI Customer Support

A full-stack Next.js App Router application that provides an AI-powered customer support chat with a persistent session history, and a lightweight admin dashboard for reviewing conversations, managing FAQs, and basic settings.

## Features

- AI chat experience with message history and typing indicator
- Full-screen chat layout with a persistent sidebar of past chats (IndexedDB/localStorage)
- Admin dashboard (overview, conversations, FAQs, settings)
- Demo authentication using an HTTP cookie to protect admin routes
- In-memory server-side store for sessions/FAQs to run seamlessly in the v0 preview
- API routes for chat, sessions, FAQs, and admin auth

## Tech Stack

- Next.js (App Router, Next.js runtime)
- React with TypeScript
- Tailwind CSS (v4 styles via app/globals.css)
- shadcn/ui components
- Vercel AI SDK for AI responses
- SWR for client-side data fetching and cache
- IndexedDB/localStorage for client-side persistence (chat sessions index)
- In-memory module store for server-side data

## Project Structure

- app/
  - page.tsx — Landing page
  - chat/page.tsx — Full-screen chat with sidebar history
  - (public)/admin/login/page.tsx — Admin login (not wrapped by protected layout)
  - (admin)/admin/
    - layout.tsx — Protected admin layout (guards via cookie)
    - page.tsx — Admin overview
    - faqs/ — Manage FAQs
    - settings/ — Demo settings page
  - api/
    - chat/route.ts — AI reply endpoint
    - sessions/route.ts — CRUD for sessions list
    - sessions/[id]/route.ts — CRUD for a single session
    - faqs/route.ts — CRUD for FAQs
    - admin/login/route.ts — Sets admin cookie on login
    - admin/logout/route.ts — Clears cookie and redirects to "/"
    - settings/route.ts — Demo settings endpoint
- lib/
  - client-storage.ts — IndexedDB/localStorage helper for chat/session list
  - store.ts — In-memory server-side data store
  - utils.ts — Utility helpers
- components/ui/\* — shadcn/ui components (preconfigured)
- public/\* — Static assets

## Data and Persistence

- Server-side: in-memory `lib/store.ts` for sessions and FAQs (no external DB required).
- Client-side: `lib/client-storage.ts` keeps a sessions index in IndexedDB (with localStorage fallback). The chat sidebar reads from this index to show past chats.

## Admin Authentication

- Demo-only auth using a cookie named `admin_auth`.
- Protected routes live under `app/(admin)/admin/*` and are guarded in `app/(admin)/admin/layout.tsx`.
- Login page is under `app/(public)/admin/login/page.tsx`, ensuring it does not inherit the protected layout.
- Logout endpoint clears the cookie and redirects to the homepage.

## Running Locally

1. Ensure Node.js 18+.
2. Install dependencies:
   - npm: `npm install`
   - pnpm: `pnpm install`
3. Start the dev server:
   - npm: `npm run dev`
   - pnpm: `pnpm dev`
4. Open http://localhost:3000.

## API Routes Overview

- POST /api/chat — Generate a model response for the chat
- GET/POST /api/sessions — List or create sessions
- GET/PUT/DELETE /api/sessions/:id — Read/update/delete a session
- GET/POST/PUT/DELETE /api/faqs — Manage FAQs
- POST /api/admin/login — Set `admin_auth` cookie
- POST /api/admin/logout — Clear cookie and redirect to “/”
- GET/POST /api/settings — Demo settings
