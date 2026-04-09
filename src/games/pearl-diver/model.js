const STEP_MS = 16
const WATERLINE = 112
const PEARL_COUNT = 8
const SHARK_COUNT = 3

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function distanceSquared(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function createPearlDiverModel({ width, height }) {
  const diver = {
    x: width * 0.5,
    y: 74,
    radius: 12,
    vx: 0,
    vy: 0,
  }

  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
  }

  const state = {
    score: 0,
    pearls: [],
    sharks: [],
    dead: false,
  }

  function randomPearl(excludeDiver = true) {
    let pearl
    let guard = 0

    do {
      pearl = {
        x: randomBetween(20, width - 20),
        y: randomBetween(WATERLINE + 22, height - 30),
        radius: randomBetween(5, 8),
      }
      guard += 1
    } while (
      excludeDiver &&
      guard < 200 &&
      distanceSquared(diver, pearl) < (diver.radius + pearl.radius + 50) ** 2
    )

    return pearl
  }

  function randomShark() {
    const direction = Math.random() > 0.5 ? 1 : -1
    const radius = randomBetween(16, 22)

    return {
      x: direction > 0 ? randomBetween(radius + 10, width * 0.35) : randomBetween(width * 0.65, width - radius - 10),
      y: randomBetween(WATERLINE + 28, height - 36),
      radius,
      vx: direction * randomBetween(1.1, 1.9),
      vy: randomBetween(-0.24, 0.24),
    }
  }

  function reset({ keepScore = false } = {}) {
    diver.x = width * 0.5
    diver.y = 74
    diver.vx = 0
    diver.vy = 0

    if (!keepScore) {
      state.score = 0
    }

    state.pearls = Array.from({ length: PEARL_COUNT }, () => randomPearl(true))
    state.sharks = Array.from({ length: SHARK_COUNT }, () => randomShark())
    state.dead = false
  }

  function setInput(nextInput) {
    input.left = Boolean(nextInput.left)
    input.right = Boolean(nextInput.right)
    input.up = Boolean(nextInput.up)
    input.down = Boolean(nextInput.down)
  }

  function advance() {
    if (state.dead) {
      return { died: true }
    }

    const underwater = diver.y + diver.radius > WATERLINE

    let ax = 0
    let ay = underwater ? 0.04 : 0.2

    if (input.left) {
      ax -= underwater ? 0.25 : 0.2
    }

    if (input.right) {
      ax += underwater ? 0.25 : 0.2
    }

    if (input.up) {
      ay -= underwater ? 0.36 : 0.32
    }

    if (input.down) {
      ay += underwater ? 0.38 : 0.22
    }

    diver.vx += ax
    diver.vy += ay

    const drag = underwater ? 0.88 : 0.93
    diver.vx *= drag
    diver.vy *= drag

    diver.vx = clamp(diver.vx, -4.2, 4.2)
    diver.vy = clamp(diver.vy, -4.2, 4.2)

    diver.x = clamp(diver.x + diver.vx, diver.radius, width - diver.radius)
    diver.y = clamp(diver.y + diver.vy, diver.radius + 4, height - diver.radius - 6)

    state.pearls = state.pearls.map((pearl) => {
      const collectDistance = diver.radius + pearl.radius
      if (distanceSquared(diver, pearl) <= collectDistance * collectDistance) {
        state.score += 1
        return randomPearl(false)
      }

      return pearl
    })

    state.sharks = state.sharks.map((shark) => {
      let nextX = shark.x + shark.vx
      let nextY = shark.y + shark.vy
      let nextVx = shark.vx
      let nextVy = shark.vy

      if (nextX - shark.radius <= 0 || nextX + shark.radius >= width) {
        nextVx *= -1
        nextX = clamp(nextX, shark.radius + 2, width - shark.radius - 2)
      }

      if (nextY - shark.radius <= WATERLINE + 8 || nextY + shark.radius >= height - 16) {
        nextVy *= -1
        nextY = clamp(nextY, WATERLINE + shark.radius + 8, height - shark.radius - 16)
      }

      if (Math.random() < 0.015) {
        nextVy = clamp(nextVy + randomBetween(-0.16, 0.16), -0.35, 0.35)
      }

      return {
        ...shark,
        x: nextX,
        y: nextY,
        vx: nextVx,
        vy: nextVy,
      }
    })

    const sharkHit = state.sharks.some((shark) => {
      const dangerRadius = diver.radius + shark.radius - 4
      return distanceSquared(diver, shark) <= dangerRadius * dangerRadius
    })

    if (sharkHit) {
      state.dead = true
      return { died: true }
    }

    return { died: false }
  }

  function getSnapshot() {
    return {
      width,
      height,
      waterline: WATERLINE,
      diver: { ...diver },
      pearls: state.pearls.map((pearl) => ({ ...pearl })),
      sharks: state.sharks.map((shark) => ({ ...shark })),
      score: state.score,
      depth: Math.max(0, Math.round(diver.y - WATERLINE)),
      dead: state.dead,
    }
  }

  function getStepMs() {
    return STEP_MS
  }

  reset({ keepScore: false })

  return {
    reset,
    setInput,
    advance,
    getSnapshot,
    getStepMs,
  }
}
