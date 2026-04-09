import { createDirectionalInput } from '../../engine/directionalInput'
import { createFrameLoop } from '../../engine/frameLoop'
import { createPersistentNumberStore } from '../../engine/persistentStore'
import { createNeonSnakeModel } from './model'
import { createNeonSnakeRenderer } from './renderer'

const BEST_SCORE_KEY = 'tamals-games-neon-snake-best'

const GAME_STATE = {
  ready: 'Ready',
  running: 'Running',
  paused: 'Paused',
  gameOver: 'Game Over',
}

export function mountNeonSnakeRush(elements) {
  const {
    canvas,
    scoreEl,
    bestEl,
    speedEl,
    stateEl,
    startButton,
    pauseButton,
    restartButton,
    touchButtons,
  } = elements

  const bestScoreStore = createPersistentNumberStore(BEST_SCORE_KEY, 0)
  const model = createNeonSnakeModel()
  const renderer = createNeonSnakeRenderer({ canvas })

  let bestScore = bestScoreStore.read()
  let status = GAME_STATE.ready

  function updateHud() {
    const snapshot = model.getSnapshot()
    scoreEl.textContent = String(snapshot.score)
    bestEl.textContent = String(bestScore)
    speedEl.textContent = `${(1000 / snapshot.stepMs).toFixed(1)}x`
    stateEl.textContent = status
  }

  function renderScene() {
    renderer.render(model.getSnapshot())
  }

  function syncBestScore() {
    const { score } = model.getSnapshot()
    if (score > bestScore) {
      bestScore = score
      bestScoreStore.write(bestScore)
    }
  }

  const loop = createFrameLoop({
    getStepMs: () => model.getStepMs(),
    onStep: () => {
      const result = model.advance()
      syncBestScore()
      renderScene()

      if (result.gameOver) {
        status = GAME_STATE.gameOver
        loop.stop()
      }

      updateHud()
    },
  })

  function start() {
    if (loop.isRunning()) {
      return
    }

    if (status === GAME_STATE.gameOver) {
      model.reset()
    }

    status = GAME_STATE.running
    updateHud()
    renderScene()
    loop.start()
  }

  function pause() {
    if (!loop.isRunning()) {
      return
    }

    loop.stop()
    status = GAME_STATE.paused
    updateHud()
  }

  function restart() {
    loop.stop()
    model.reset()
    status = GAME_STATE.ready
    renderScene()
    updateHud()
  }

  const input = createDirectionalInput({
    onDirection: (nextDirection) => model.queueDirection(nextDirection),
    onAction: () => {
      if (!loop.isRunning() && status !== GAME_STATE.gameOver) {
        start()
      }
    },
  })

  startButton.addEventListener('click', start)
  pauseButton.addEventListener('click', pause)
  restartButton.addEventListener('click', restart)

  input.bindKeyboard()
  input.bindTouchButtons(touchButtons)
  input.bindTapSurface(canvas)
  input.bindSwipeSurface(canvas, 18)

  renderScene()
  updateHud()

  return {
    start,
    pause,
    restart,
    destroy: () => {
      loop.stop()
      input.destroy()
    },
  }
}
