# Tamal's Games

A static mini arcade game collection site built with Vite and designed for GitHub Pages.

## Scripts

- `npm run dev` - Start local development server.
- `npm run build` - Build production assets into `dist/`.
- `npm run preview` - Preview the production build locally.

## Project Structure

- `index.html` - app entry HTML with the site title and metadata.
- `src/main.js` - landing page composition and game module wiring.
- `src/data/games.js` - starter game metadata to power the card grid.
- `src/style.css` - visual theme and responsive layout.
- `src/engine/` - reusable game engine utilities (loop, input, persistence).
- `src/games/neon-snake-rush/` - Neon Snake Rush game module (model + renderer + setup).
- `.github/workflows/deploy.yml` - GitHub Pages deployment workflow.

## Deployment

Pushing to the `main` branch triggers GitHub Actions to build and deploy the site to GitHub Pages.
