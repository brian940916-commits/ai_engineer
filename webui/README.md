# Plant Buddy — Web UI

React + Vite + TypeScript frontend for the Plant Buddy water tracker. Implements
`documents/07-frontend-design.md` with the visual scheme from
`documents/08-design-brief.md`. The plant's `stage`/`mood` are computed by the
backend and only rendered here (single source of truth — see
`documents/01-system-architecture.md`).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

Set the API base URL in `webui/.env.local` (copy from `.env.example`):

```
VITE_API_BASE=https://<api-id>.execute-api.<region>.amazonaws.com/prod
```

## Build

```bash
npm run build    # type-checks then outputs to webui/dist/
npm run preview  # serve the production build locally
```

## Deployment notes

- Hosted on **GitHub Pages**; `vite.config.ts` sets `base: '/ai_engineer/'` to
  match the repo name. If the repo is renamed, update `base` to match, or assets
  will 404.
- The `.github/workflows/deploy.yml` workflow builds on push to `main` (paths
  `webui/**`) and needs `VITE_API_BASE` at build time — set it as the `API_BASE`
  repo secret. Set **Settings → Pages → Source = GitHub Actions**.
- The HTTP API's CORS `AllowOrigins` must include the Pages origin
  (`https://<user>.github.io`).

## Notes

- **Identity:** an anonymous UUID is generated once and kept in `localStorage`,
  sent as the `X-User-Id` header on every request. Clearing storage starts a
  fresh plant.
- **Reminders** use the browser Notification API and only fire while the tab is
  open (closed-tab Web Push is an out-of-scope stretch goal).
