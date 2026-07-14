# Deployment notes

## Required environment variables
Set these in your hosting provider (for example Vercel) before deploying:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; required for match creation and owner-only write operations)

This project also contains `.env.local` for the supplied Supabase project so it can run immediately in a local build. For a public deployment, set the same values in the hosting dashboard.

## Cross-phone sharing
Sharing uses the deployed site's current public origin and creates links in this form:

`https://your-public-domain.example/match/SHARECODE`

A temporary/private preview URL may not open on another phone. Deploy the app to a public URL for reliable cross-device sharing.
