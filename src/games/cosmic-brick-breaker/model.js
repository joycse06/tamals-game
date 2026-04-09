const DEFAULT_STEP_MS = 16
const DEFAULT_LIVES = 3

const BRICK_COLORS = ['#22d3ee', '#2dd4bf', '#38bdf8', '#a78bfa', '#f59e0b', '#fb7185']

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function circleRectCollision(ball, rect) {
  const nearestX = clamp(ball.x, rect.x, rect.x + rect.width)
  const nearestY = clamp(ball.y, rect.y, rect.y + rect.height)
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY

  return {
    hit: dx * dx + dy * dy <= ball.radius * ball.radius,
    dx,
    dy,
  }
}

function createBricks({ width, level }) {
  const cols = 9
  const rows = Math.min(4 + Math.floor((level - 1) / 2), 7)
  const gap = 8
  const marginX = 24
  const top = 32
  const brickWidth = Math.floor((width - marginX * 2 - gap * (cols - 1)) / cols)
  const brickHeight = 18

  const bricks = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const hp = level > 2 && row % 3 === 0 ? 2 : 1

      bricks.push({
        x: marginX + col * (brickWidth + gap),
        y: top + row * (brickHeight + gap),
        width: brickWidth,
        height: brickHeight,
        hp,
        maxHp: hp,
        color: BRICK_COLORS[(row + col) % BRICK_COLORS.length],
      })
    }
  }

  return bricks
}

export function createCosmicBrickBreakerModel(options) {
  const width = options.width
  const height = options.height

  const state = {
    paddle: {
      width: 96,
      height: 12,
      speed: 8,
      x: width / 2 - 48,
      y: height - 32,
      direction: 0,
    },
    ball: {
      x: width / 2,
      y: height - 45,
      radius: 7,
      vx: 0,
      vy: 0,
      baseSpeed: 4.6,
      attached: true,
    },
    lives: DEFAULT_LIVES,
    level: 1,
    score: 0,
    gameOver: false,
    bricks: [],
  }

  function dockBall() {
    state.ball.attached = true
    state.ball.vx = 0
    state.ball.vy = 0
    state.ball.x = state.paddle.x + state.paddle.width / 2
    state.ball.y = state.paddle.y - state.ball.radius - 2
  }

  function nextLevel() {
    state.level += 1
    state.ball.baseSpeed = Math.min(state.ball.baseSpeed + 0.25, 8)
    state.bricks = createBricks({ width, level: state.level })
    dockBall()
  }

  function reset({ full = true } = {}) {
    state.paddle.x = width / 2 - state.paddle.width / 2
    state.paddle.direction = 0

    if (full) {
      state.lives = DEFAULT_LIVES
      state.level = 1
      state.score = 0
      state.gameOver = false
      state.ball.baseSpeed = 4.6
      state.bricks = createBricks({ width, level: state.level })
    }

    dockBall()
  }

  function launchBall() {
    if (!state.ball.attached || state.gameOver) {
      return
    }

    state.ball.attached = false
    const drift = state.paddle.direction === 0 ? (Math.random() > 0.5 ? 1 : -1) : state.paddle.direction
    state.ball.vx = drift * state.ball.baseSpeed * 0.65
    state.ball.vy = -state.ball.baseSpeed
  }

  function setPaddleDirection(direction) {
    state.paddle.direction = clamp(direction, -1, 1)
  }

  function advance() {
    if (state.gameOver) {
      return { gameOver: true }
    }

    state.paddle.x = clamp(
      state.paddle.x + state.paddle.direction * state.paddle.speed,
      0,
      width - state.paddle.width,
    )

    if (state.ball.attached) {
      state.ball.x = state.paddle.x + state.paddle.width / 2
      state.ball.y = state.paddle.y - state.ball.radius - 2
      return { gameOver: false }
    }

    state.ball.x += state.ball.vx
    state.ball.y += state.ball.vy

    if (state.ball.x - state.ball.radius <= 0 && state.ball.vx < 0) {
      state.ball.x = state.ball.radius
      state.ball.vx *= -1
    }

    if (state.ball.x + state.ball.radius >= width && state.ball.vx > 0) {
      state.ball.x = width - state.ball.radius
      state.ball.vx *= -1
    }

    if (state.ball.y - state.ball.radius <= 0 && state.ball.vy < 0) {
      state.ball.y = state.ball.radius
      state.ball.vy *= -1
    }

    if (state.ball.y - state.ball.radius > height) {
      state.lives -= 1

      if (state.lives <= 0) {
        state.gameOver = true
        return { gameOver: true, lifeLost: true }
      }

      dockBall()
      return { gameOver: false, lifeLost: true }
    }

    const paddleRect = state.paddle
    const hitPaddle =
      state.ball.y + state.ball.radius >= paddleRect.y &&
      state.ball.y - state.ball.radius <= paddleRect.y + paddleRect.height &&
      state.ball.x >= paddleRect.x &&
      state.ball.x <= paddleRect.x + paddleRect.width &&
      state.ball.vy > 0

    if (hitPaddle) {
      state.ball.y = paddleRect.y - state.ball.radius - 1

      const contact = (state.ball.x - (paddleRect.x + paddleRect.width / 2)) / (paddleRect.width / 2)
      const speed = Math.min(Math.hypot(state.ball.vx, state.ball.vy) + 0.08, 9)
      const nextVx = contact * speed * 0.92
      state.ball.vx = nextVx
      state.ball.vy = -Math.sqrt(Math.max(0.5, speed * speed - nextVx * nextVx))
    }

    let brickBroken = false
    for (const brick of state.bricks) {
      if (brick.hp <= 0) {
        continue
      }

      const collision = circleRectCollision(state.ball, brick)
      if (!collision.hit) {
        continue
      }

      brick.hp -= 1
      if (brick.hp <= 0) {
        state.score += 100
        brickBroken = true
      } else {
        state.score += 40
      }

      if (Math.abs(collision.dx) > Math.abs(collision.dy)) {
        state.ball.vx *= -1
      } else if (Math.abs(collision.dy) > Math.abs(collision.dx)) {
        state.ball.vy *= -1
      } else {
        state.ball.vx *= -1
        state.ball.vy *= -1
      }

      break
    }

    const remaining = state.bricks.some((brick) => brick.hp > 0)
    if (!remaining) {
      nextLevel()
      return { gameOver: false, levelUp: true, brickBroken }
    }

    return { gameOver: false, brickBroken }
  }

  function getSnapshot() {
    return {
      width,
      height,
      paddle: { ...state.paddle },
      ball: { ...state.ball },
      lives: state.lives,
      level: state.level,
      score: state.score,
      gameOver: state.gameOver,
      bricks: state.bricks.map((brick) => ({ ...brick })),
    }
  }

  function getStepMs() {
    return DEFAULT_STEP_MS
  }

  reset({ full: true })

  return {
    reset,
    advance,
    launchBall,
    setPaddleDirection,
    getSnapshot,
    getStepMs,
  }
}
