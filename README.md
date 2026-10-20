# UnderConstructionSite

Einfache „Under Construction"-Seite für feh.re, ausgeliefert als Cloudflare Worker.

- `index.js` – Worker, der die HTML-Seite zurückgibt
- `wrangler.json` – Worker-Konfiguration (Name: `underconstruction`)

Deployment: Push auf `main` löst automatisch einen Build bei Cloudflare aus (`npx wrangler deploy`).
