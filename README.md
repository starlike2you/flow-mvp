# Flow MVP

Greenfield TanStack Start implementation of the Flow 1기 MVP.

## Local Development

```bash
npm install
npm run dev
```

The app runs without external service keys. Rapid, Daily, Lovable AI Gateway, ElevenLabs,
Supabase Storage, and Resend are represented by adapter boundaries with stub fallbacks.

## Useful Routes

- `/` - landing page and recruitment CTA
- `/onboarding` - member onboarding form
- `/dashboard` - member dashboard with weekly content, session, notes, audiobook
- `/admin` - operator matching dashboard
- `/session/$sessionId` - Daily mount placeholder, questions, AI teacher, artifact generation
- `/api/rapid/webhook` - Rapid webhook endpoint with HMAC verification

## Verification

```bash
npm run typecheck
npm run test
npm run build
```
