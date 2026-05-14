This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.







------------------------
Technical overview

The production app under src/ is a Next.js 16 application on the App Router, written in strict TypeScript, with React 19 as the UI runtime. Styling is Tailwind CSS v4 (PostCSS pipeline, shared tokens in CSS imports) plus a shadcn-style layer built on Radix UI primitives, class-variance-authority, clsx / tailwind-merge, lucide-react for icons, sonner for toasts, and next-themes for class-based light/dark/system theming. The repo also ships many UI-adjacent libraries (e.g. Motion, Recharts, React Hook Form); @mui/* is listed in package.json but is not imported in src/, so the live shell is Radix/Tailwind-first. There is no server-side database: authentication and gamification state are a demo pattern—a localStorage “users registry” plus current session snapshot, with per-user tasks keyed in localStorage, while study decks are persisted in IndexedDB (adal_deck_blob_v1) with only deck id ordering in localStorage, which keeps large payloads out of synchronous storage and fits a fully client-owned data model. Intelligence is isolated on the server: Route Handlers under src/app/api/* run with export const runtime = "nodejs" and call Google’s Gemini through @google/generative-ai (configured at request time via GOOGLE_GEMINI_API_KEY / GEMINI_API_KEY / GOOGLE_AI_API_KEY). /api/process-documents accepts multipart uploads (in-memory, no disk DB), extracts DOCX with Mammoth and PDF text with pdf-parse, and falls back to sending raw PDF bytes to Gemini when extraction is thin—an explicit serverless/Vercel reliability tradeoff documented in code—returning a generated StoredDeck the client then saves. /api/feynman implements the Feynman flow as structured JSON evaluation plus a separate plain-text tutor chat. Product logic on the client includes functional React state for XP/coins (to avoid stale updates), weighted gacha over a catalog, canvas-confetti celebrations, and a Pomodoro subsystem in its own context nested under the authenticated app layout.

Vercel deployment

Deployment is standard Next-on-Vercel: connect the Git repository, use the default install + next build pipeline, and run next start on Vercel’s Node runtime for production. The only repo-specific platform knob is vercel.json, which sets maxDuration: 60 seconds for src/app/api/process-documents/route.ts so long-running document + LLM work is less likely to hit the default serverless timeout. You must configure GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY (or GOOGLE_AI_API_KEY) in the Vercel project’s Environment Variables for Production (and Preview if needed) and redeploy so the API routes can authenticate to Gemini; there is no custom next.config.ts beyond the template—no edge runtime is forced for these routes, and next.config.ts is empty of special deployment hacks, so behavior matches Vercel’s first-party Next.js integration.
