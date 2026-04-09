const DEFAULT_GRID_SIZE = 21
const DEFAULT_BASE_STEP_MS = 155
const DEFAULT_MIN_STEP_MS = 70
const DEFAULT_SPEEDUP_PER_FOOD = 4

function areOpposites(a, b) {
  return a.x === -b.x && a.y === -b.y
}

function cellEquals(a, b) {
  return a.x === b.x && a.y === b.y
}

function randomInt(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive)
}

function createInitialSnake() {
  return [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ]
}

export function createNeonSnakeModel(options = {}) {
  const gridSize = options.gridSize ?? DEFAULT_GRID_SIZE
  const baseStepMs = options.baseStepMs ?? DEFAULT_BASE_STEP_MS
  const minStepMs = options.minStepMs ?? DEFAULT_MIN_STEP_MS
  const speedupPerFood = options.speedupPerFood ?? DEFAULT_SPEEDUP_PER_FOOD

  const state = {
    snake: createInitialSnake(),
    direction: { x: 1, y: 0 },
    queuedDirection: { x: 1, y: 0 },
    food: { x: 14, y: 10 },
    score: 0,
    stepMs: baseStepMs,
    gameOver: false,
  }

  function placeFood() {
    let attempts = 0
    let candidate = null

    while (attempts < 500) {
      attempts += 1
      candidate = { x: randomInt(gridSize), y: randomInt(gridSize) }
      if (!state.snake.some((segment) => cellEquals(segment, candidate))) {
        state.food = candidate
        return
      }
    }

    state.food = candidate ?? { x: 0, y: 0 }
  }

  function queueDirection(nextDirection) {
    if (areOpposites(nextDirection, state.direction)) {
      return
    }

    state.queuedDirection = nextDirection
  }

  function reset() {
    state.snake = createInitialSnake()
    state.direction = { x: 1, y: 0 }
    state.queuedDirection = { x: 1, y: 0 }
    state.score = 0
    state.stepMs = baseStepMs
    state.gameOver = false
    placeFood()
  }

  function advance() {
    if (state.gameOver) {
      return { gameOver: true, score: state.score }
    }

    state.direction = state.queuedDirection

    const nextHead = {
      x: state.snake[0].x + state.direction.x,
      y: state.snake[0].y + state.direction.y,
    }

    if (
      nextHead.x < 0 ||
      nextHead.x >= gridSize ||
      nextHead.y < 0 ||
      nextHead.y >= gridSize ||
      state.snake.some((segment) => cellEquals(segment, nextHead))
    ) {
      state.gameOver = true
      return { gameOver: true, score: state.score }
    }

    state.snake.unshift(nextHead)

    let ateFood = false
    if (cellEquals(nextHead, state.food)) {
      ateFood = true
      state.score += 1
      state.stepMs = Math.max(minStepMs, baseStepMs - state.score * speedupPerFood)
      placeFood()
    } else {
      state.snake.pop()
    }

    return {
      gameOver: false,
      score: state.score,
      ateFood,
    }
  }

  function getStepMs() {
    return state.stepMs
  }

  function getSnapshot() {
    return {
      gridSize,
      snake: state.snake.map((segment) => ({ ...segment })),
      direction: { ...state.direction },
      food: { ...state.food },
      score: state.score,
      stepMs: state.stepMs,
      gameOver: state.gameOver,
    }
  }

  reset()

  return {
    queueDirection,
    reset,
    advance,
    getStepMs,
    getSnapshot,
  }
}
