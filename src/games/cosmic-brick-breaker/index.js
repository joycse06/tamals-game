import { createFrameLoop } from '../../engine/frameLoop'
import { createPersistentNumberStore } from '../../engine/persistentStore'
import { createCosmicBrickBreakerModel } from './model'
import { createCosmicBrickBreakerRenderer } from './renderer'

const GAME_STATE = {
  ready: 'Ready',
  running: 'Running',
  paused: 'Paused',
  gameOver: 'Game Over',
}

const BEST_SCORE_KEY = 'tamals-games-cosmic-brick-breaker-best'

export function mountCosmicBrickBreaker(elements) {
  const {
    canvas,
    scoreEl,
    bestEl,
    livesEl,
    levelEl,
    stateEl,
    startButton,
    pauseButton,
    restartButton,
    launchButton,
    leftButton,
    rightButton,
  } = elements

  const model = createCosmicBrickBreakerModel({ width: canvas.width, height: canvas.height })
  const renderer = createCosmicBrickBreakerRenderer({ canvas })
  const bestScoreStore = createPersistentNumberStore(BEST_SCORE_KEY, 0)

  let status = GAME_STATE.ready
  let bestScore = bestScoreStore.read()
  let leftHeld = false
  let rightHeld = false
  const cleanupFns = []

  function syncPaddleDirection() {
    if (leftHeld && !rightHeld) {
      model.setPaddleDirection(-1)
      return
    }

    if (rightHeld && !leftHeld) {
      model.setPaddleDirection(1)
      return
    }

    model.setPaddleDirection(0)
  }

  function updateHud() {
    const snapshot = model.getSnapshot()
    scoreEl.textContent = String(snapshot.score)
    bestEl.textContent = String(bestScore)
    livesEl.textContent = String(snapshot.lives)
    levelEl.textContent = String(snapshot.level)
    stateEl.textContent = status
  }

  function renderScene() {
    renderer.render(model.getSnapshot(), status)
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

      if (result.gameOver) {
        status = GAME_STATE.gameOver
        loop.stop()
      }

      renderScene()
      updateHud()
    },
  })

  function ensureLoopStarted() {
    if (!loop.isRunning()) {
      status = GAME_STATE.running
      loop.start()
    }
  }

  function start() {
    if (status === GAME_STATE.gameOver) {
      model.reset({ full: true })
      status = GAME_STATE.ready
    }

    ensureLoopStarted()
    renderScene()
    updateHud()
  }

  function pause() {
    if (!loop.isRunning()) {
      return
    }

    loop.stop()
    status = GAME_STATE.paused
    renderScene()
    updateHud()
  }

  function restart() {
    loop.stop()
    model.reset({ full: true })
    status = GAME_STATE.ready
    leftHeld = false
    rightHeld = false
    syncPaddleDirection()
    renderScene()
    updateHud()
  }

  function launch() {
    if (status === GAME_STATE.gameOver) {
      return
    }

    ensureLoopStarted()
    model.launchBall()
    renderScene()
    updateHud()
  }

  function onKeyDown(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      leftHeld = true
      syncPaddleDirection()
      ensureLoopStarted()
      event.preventDefault()
      return
    }

    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      rightHeld = true
      syncPaddleDirection()
      ensureLoopStarted()
      event.preventDefault()
      return
    }

    if (event.code === 'Space') {
      launch()
      event.preventDefault()
    }
  }

  function onKeyUp(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      leftHeld = false
      syncPaddleDirection()
      event.preventDefault()
      return
    }

    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      rightHeld = false
      syncPaddleDirection()
      event.preventDefault()
    }
  }

  function holdLeft() {
    leftHeld = true
    syncPaddleDirection()
    ensureLoopStarted()
  }

  function releaseLeft() {
    leftHeld = false
    syncPaddleDirection()
  }

  function holdRight() {
    rightHeld = true
    syncPaddleDirection()
    ensureLoopStarted()
  }

  function releaseRight() {
    rightHeld = false
    syncPaddleDirection()
  }

  const pointerUpEvents = ['pointerup', 'pointercancel', 'pointerleave']

  function onLeftPointerDown(event) {
    event.preventDefault()
    holdLeft()
  }

  function onRightPointerDown(event) {
    event.preventDefault()
    holdRight()
  }

  startButton.addEventListener('click', start)
  cleanupFns.push(() => startButton.removeEventListener('click', start))
  pauseButton.addEventListener('click', pause)
  cleanupFns.push(() => pauseButton.removeEventListener('click', pause))
  restartButton.addEventListener('click', restart)
  cleanupFns.push(() => restartButton.removeEventListener('click', restart))
  launchButton.addEventListener('click', launch)
  cleanupFns.push(() => launchButton.removeEventListener('click', launch))

  leftButton.addEventListener('pointerdown', onLeftPointerDown)
  cleanupFns.push(() => leftButton.removeEventListener('pointerdown', onLeftPointerDown))
  rightButton.addEventListener('pointerdown', onRightPointerDown)
  cleanupFns.push(() => rightButton.removeEventListener('pointerdown', onRightPointerDown))
  pointerUpEvents.forEach((name) => {
    leftButton.addEventListener(name, releaseLeft)
    rightButton.addEventListener(name, releaseRight)
    cleanupFns.push(() => leftButton.removeEventListener(name, releaseLeft))
    cleanupFns.push(() => rightButton.removeEventListener(name, releaseRight))
  })

  window.addEventListener('keydown', onKeyDown)
  cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown))
  window.addEventListener('keyup', onKeyUp)
  cleanupFns.push(() => window.removeEventListener('keyup', onKeyUp))

  renderScene()
  updateHud()

  return {
    start,
    pause,
    restart,
    launch,
    destroy: () => {
      loop.stop()
      cleanupFns.forEach((cleanup) => cleanup())
      cleanupFns.length = 0
    },
  }
}
