import { createFrameLoop } from '../../engine/frameLoop'
import { createPersistentNumberStore } from '../../engine/persistentStore'
import { createPearlDiverModel } from './model'
import { createPearlDiverRenderer } from './renderer'

const GAME_STATE = {
  ready: 'Ready',
  running: 'Running',
  paused: 'Paused',
  gameOver: 'Game Over',
}

const BEST_SCORE_KEY = 'tamals-games-pearl-diver-best'

export function mountPearlDiver(elements) {
  const {
    canvas,
    scoreEl,
    bestEl,
    depthEl,
    stateEl,
    startButton,
    pauseButton,
    resetButton,
    controlButtons,
  } = elements

  const model = createPearlDiverModel({ width: canvas.width, height: canvas.height })
  const renderer = createPearlDiverRenderer({ canvas })
  const bestScoreStore = createPersistentNumberStore(BEST_SCORE_KEY, 0)

  let status = GAME_STATE.ready
  let bestScore = bestScoreStore.read()
  const cleanupFns = []

  const inputState = {
    left: false,
    right: false,
    up: false,
    down: false,
  }
  let dragPointerId = null
  let dragStartX = 0
  let dragStartY = 0

  function syncInput() {
    model.setInput(inputState)
  }

  function setDirection(direction, active) {
    if (!(direction in inputState)) {
      return
    }

    inputState[direction] = active
    syncInput()

    if (active && !loop.isRunning()) {
      start()
    }
  }

  function clearDirections() {
    inputState.left = false
    inputState.right = false
    inputState.up = false
    inputState.down = false
    syncInput()
  }

  function setDirectionsFromDrag(dx, dy) {
    const threshold = 14
    inputState.left = dx < -threshold
    inputState.right = dx > threshold
    inputState.up = dy < -threshold
    inputState.down = dy > threshold
    syncInput()

    if ((inputState.left || inputState.right || inputState.up || inputState.down) && !loop.isRunning()) {
      start()
    }
  }

  function syncBestScore() {
    const { score } = model.getSnapshot()
    if (score > bestScore) {
      bestScore = score
      bestScoreStore.write(bestScore)
    }
  }

  function updateHud() {
    const snapshot = model.getSnapshot()
    scoreEl.textContent = String(snapshot.score)
    bestEl.textContent = String(bestScore)
    depthEl.textContent = `${snapshot.depth}px`
    stateEl.textContent = status
  }

  function renderScene() {
    renderer.render(model.getSnapshot(), status)
  }

  const loop = createFrameLoop({
    getStepMs: () => model.getStepMs(),
    onStep: () => {
      const outcome = model.advance()
      syncBestScore()

      if (outcome.died) {
        loop.stop()
        clearDirections()
        status = GAME_STATE.gameOver
      }

      renderScene()
      updateHud()
    },
  })

  function start() {
    if (status === GAME_STATE.gameOver) {
      model.reset({ keepScore: false })
      status = GAME_STATE.ready
    }

    if (!loop.isRunning()) {
      loop.start()
    }

    status = GAME_STATE.running
    updateHud()
    renderScene()
  }

  function pause() {
    if (status === GAME_STATE.gameOver) {
      return
    }

    if (loop.isRunning()) {
      loop.stop()
    }

    status = GAME_STATE.paused
    updateHud()
    renderScene()
  }

  function reset() {
    loop.stop()
    model.reset({ keepScore: false })
    clearDirections()
    dragPointerId = null
    status = GAME_STATE.ready
    renderScene()
    updateHud()
  }

  function onKeyDown(event) {
    const byCode = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowUp: 'up',
      KeyW: 'up',
      ArrowDown: 'down',
      KeyS: 'down',
    }

    const direction = byCode[event.code]
    if (!direction) {
      return
    }

    event.preventDefault()
    setDirection(direction, true)
  }

  function onKeyUp(event) {
    const byCode = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowUp: 'up',
      KeyW: 'up',
      ArrowDown: 'down',
      KeyS: 'down',
    }

    const direction = byCode[event.code]
    if (!direction) {
      return
    }

    event.preventDefault()
    setDirection(direction, false)
  }

  startButton.addEventListener('click', start)
  cleanupFns.push(() => startButton.removeEventListener('click', start))

  pauseButton.addEventListener('click', pause)
  cleanupFns.push(() => pauseButton.removeEventListener('click', pause))

  resetButton.addEventListener('click', reset)
  cleanupFns.push(() => resetButton.removeEventListener('click', reset))

  window.addEventListener('keydown', onKeyDown)
  cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown))

  window.addEventListener('keyup', onKeyUp)
  cleanupFns.push(() => window.removeEventListener('keyup', onKeyUp))

  const pointerReleaseEvents = ['pointerup', 'pointercancel', 'pointerleave']

  function onCanvasPointerDown(event) {
    if (event.pointerType === 'mouse') {
      return
    }

    dragPointerId = event.pointerId
    dragStartX = event.clientX
    dragStartY = event.clientY
    start()
    event.preventDefault()
  }

  function onCanvasPointerMove(event) {
    if (dragPointerId === null || event.pointerId !== dragPointerId) {
      return
    }

    const dx = event.clientX - dragStartX
    const dy = event.clientY - dragStartY
    setDirectionsFromDrag(dx, dy)
    event.preventDefault()
  }

  function onCanvasPointerUp(event) {
    if (dragPointerId === null || event.pointerId !== dragPointerId) {
      return
    }

    dragPointerId = null
    clearDirections()
    event.preventDefault()
  }

  canvas.addEventListener('pointerdown', onCanvasPointerDown)
  cleanupFns.push(() => canvas.removeEventListener('pointerdown', onCanvasPointerDown))
  canvas.addEventListener('pointermove', onCanvasPointerMove)
  cleanupFns.push(() => canvas.removeEventListener('pointermove', onCanvasPointerMove))
  canvas.addEventListener('pointerup', onCanvasPointerUp)
  cleanupFns.push(() => canvas.removeEventListener('pointerup', onCanvasPointerUp))
  canvas.addEventListener('pointercancel', onCanvasPointerUp)
  cleanupFns.push(() => canvas.removeEventListener('pointercancel', onCanvasPointerUp))
  canvas.addEventListener('pointerleave', onCanvasPointerUp)
  cleanupFns.push(() => canvas.removeEventListener('pointerleave', onCanvasPointerUp))

  controlButtons.forEach((button) => {
    const direction = button.dataset.direction
    if (!direction) {
      return
    }

    const onDown = (event) => {
      event.preventDefault()
      setDirection(direction, true)
    }

    const onUp = () => {
      setDirection(direction, false)
    }

    button.addEventListener('pointerdown', onDown)
    cleanupFns.push(() => button.removeEventListener('pointerdown', onDown))

    pointerReleaseEvents.forEach((eventName) => {
      button.addEventListener(eventName, onUp)
      cleanupFns.push(() => button.removeEventListener(eventName, onUp))
    })
  })

  renderScene()
  updateHud()

  return {
    start,
    pause,
    reset,
    destroy: () => {
      loop.stop()
      cleanupFns.forEach((cleanup) => cleanup())
      cleanupFns.length = 0
    },
  }
}
