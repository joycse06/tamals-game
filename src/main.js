import './style.css'
import { games } from './data/games'
import { mountNeonSnakeRush } from './games/neon-snake-rush/index.js'

function renderGameCard(game) {
  const action = game.playable
    ? `<button class="game-launch game-launch-active" type="button" data-game-id="${game.id}">Play Now</button>`
    : '<button class="game-launch game-launch-disabled" type="button" disabled aria-disabled="true">Launching Soon</button>'

  return `
    <article class="game-card tone-${game.tone}">
      <p class="game-chip">${game.genre}</p>
      <h3>${game.title}</h3>
      <p>${game.blurb}</p>
      ${action}
    </article>
  `
}

const cards = games.map(renderGameCard).join('')

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
        <a class="button button-secondary" href="#neon-snake-rush">Play Neon Snake Rush</a>
      </div>

      <ul class="hero-stats" aria-label="Highlights">
        <li>
          <strong>6</strong>
          <span>Games queued</span>
        </li>
        <li>
          <strong>1</strong>
          <span>Game live now</span>
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

    <section id="neon-snake-rush" class="section snake-section" aria-labelledby="snake-title">
      <div class="section-heading">
        <p class="section-kicker">Playable Right Now</p>
        <h2 id="snake-title">Neon Snake Rush</h2>
      </div>

      <div class="snake-layout">
        <div class="snake-board-shell">
          <canvas
            id="snake-canvas"
            class="snake-canvas"
            width="420"
            height="420"
            aria-label="Neon Snake Rush game board"
          ></canvas>
        </div>

        <aside class="snake-panel">
          <div class="snake-stats">
            <div>
              <p class="snake-stat-label">Score</p>
              <p id="snake-score" class="snake-stat-value">0</p>
            </div>
            <div>
              <p class="snake-stat-label">Best</p>
              <p id="snake-best" class="snake-stat-value">0</p>
            </div>
            <div>
              <p class="snake-stat-label">Speed</p>
              <p id="snake-speed" class="snake-stat-value">0.0x</p>
            </div>
            <div>
              <p class="snake-stat-label">State</p>
              <p id="snake-state" class="snake-stat-value">Ready</p>
            </div>
          </div>

          <div class="snake-actions">
            <button id="snake-start" class="snake-button snake-button-primary" type="button">Start Run</button>
            <button id="snake-pause" class="snake-button" type="button">Pause</button>
            <button id="snake-restart" class="snake-button" type="button">Restart</button>
          </div>

          <p class="snake-help">
            Controls: Arrow Keys or WASD. On touch screens, use the D-pad.
          </p>

          <div class="snake-pad" aria-label="Touch controls">
            <div class="snake-pad-row">
              <button class="snake-pad-button" type="button" data-direction="up">Up</button>
            </div>
            <div class="snake-pad-row">
              <button class="snake-pad-button" type="button" data-direction="left">Left</button>
              <button class="snake-pad-button" type="button" data-direction="down">Down</button>
              <button class="snake-pad-button" type="button" data-direction="right">Right</button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section id="about" class="section about">
      <h2>Built for GitHub Pages</h2>
      <p>
        The project now includes a reusable game engine layer, isolated game modules, and an
        automated deployment pipeline. New games can plug in without crowding the landing page code.
      </p>
    </section>

    <footer class="site-footer">
      <p>&copy; ${new Date().getFullYear()} Tamal's Games</p>
    </footer>
  </main>
`

const snakeGame = mountNeonSnakeRush({
  canvas: document.querySelector('#snake-canvas'),
  scoreEl: document.querySelector('#snake-score'),
  bestEl: document.querySelector('#snake-best'),
  speedEl: document.querySelector('#snake-speed'),
  stateEl: document.querySelector('#snake-state'),
  startButton: document.querySelector('#snake-start'),
  pauseButton: document.querySelector('#snake-pause'),
  restartButton: document.querySelector('#snake-restart'),
  touchButtons: Array.from(document.querySelectorAll('.snake-pad-button')),
})

const snakeSection = document.querySelector('#neon-snake-rush')

Array.from(document.querySelectorAll('[data-game-id="neon-snake-rush"]')).forEach((button) => {
  button.addEventListener('click', () => {
    snakeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    snakeGame.start()
  })
})
