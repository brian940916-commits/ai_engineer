// The deployed HTTP API base URL. Set VITE_API_BASE in .env.local (dev) or
// .env.production / a CI secret (GitHub Pages build). The placeholder default
// lets the app build before the backend exists — API calls will simply fail
// and surface a "can't reach server" toast until a real URL is configured.
export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'https://default.execute-api.us-west-2.amazonaws.com/prod';
