import './style.css'
import { games } from './data/games'

const cards = games
  .map(
    (game) => `
      <article class="game-card tone-${game.tone}">
        <p class="game-chip">${game.genre}</p>
        <h3>${game.title}</h3>
        <p>${game.blurb}</p>
        <button type="button" disabled aria-disabled="true">Launching Soon</button>
      </article>
    `,
  )
  .join('')

document.querySelector('#app').innerHTML = `
  <main class="site-shell">
    <section class="hero" aria-labelledby="site-title">
      <p class="eyebrow">Mini Arcade Collection</p>
      <h1 id="site-title">Tamal's Games</h1>
      <p class="hero-copy">
        Quick-play browser games with a playful retro spirit. Jump in for a few minutes,
        chase your high score, and come back for fresh drops.
      </p>

      <div class="hero-actions">
        <a class="button button-primary" href="#games">Explore Lineup</a>
        <a class="button button-secondary" href="#about">Project Roadmap</a>
      </div>

      <ul class="hero-stats" aria-label="Highlights">
        <li>
          <strong>6</strong>
          <span>Games queued</span>
        </li>
        <li>
          <strong>100%</strong>
          <span>Static deployable</span>
        </li>
        <li>
          <strong>Fast</strong>
          <span>Built with Vite</span>
        </li>
      </ul>
    </section>

    <section id="games" class="section">
      <div class="section-heading">
        <p class="section-kicker">Arcade Lineup</p>
        <h2>Pick your next obsession</h2>
      </div>
      <div class="games-grid">
        ${cards}
      </div>
    </section>

    <section id="about" class="section about">
      <h2>Built for GitHub Pages</h2>
      <p>
        This collection starts with a polished landing experience and a structure that makes
        adding each game straightforward. Every release can be automatically deployed with
        GitHub Actions.
      </p>
    </section>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} Tamal's Games</p>
    </footer>
  </main>
`
