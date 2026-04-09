function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const bigint = Number.parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function buildStarfield(width, height, count) {
  const stars = []

  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    })
  }

  return stars
}

export function createCosmicBrickBreakerRenderer({ canvas }) {
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Cosmic Brick Breaker requires canvas 2d support.')
  }

  const stars = buildStarfield(canvas.width, canvas.height, 50)

  function drawBackground(snapshot) {
    const gradient = context.createLinearGradient(0, 0, 0, snapshot.height)
    gradient.addColorStop(0, '#0b1020')
    gradient.addColorStop(1, '#101f45')

    context.fillStyle = gradient
    context.fillRect(0, 0, snapshot.width, snapshot.height)

    for (const star of stars) {
      context.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
      context.beginPath()
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  function drawBricks(snapshot) {
    snapshot.bricks.forEach((brick) => {
      if (brick.hp <= 0) {
        return
      }

      context.fillStyle = brick.color
      context.fillRect(brick.x, brick.y, brick.width, brick.height)

      context.strokeStyle = hexToRgba(brick.color, 0.45)
      context.lineWidth = 1
      context.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1)

      if (brick.hp > 1) {
        context.fillStyle = 'rgba(255, 255, 255, 0.55)'
        context.fillRect(brick.x + brick.width * 0.2, brick.y + brick.height * 0.35, brick.width * 0.6, 3)
      }
    })
  }

  function drawPaddle(snapshot) {
    const paddle = snapshot.paddle

    context.fillStyle = '#22d3ee'
    context.shadowColor = 'rgba(34, 211, 238, 0.65)'
    context.shadowBlur = 12
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
    context.shadowBlur = 0
  }

  function drawBall(snapshot) {
    const ball = snapshot.ball

    context.fillStyle = '#f8fafc'
    context.shadowColor = 'rgba(255, 255, 255, 0.72)'
    context.shadowBlur = 12
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.fill()
    context.shadowBlur = 0
  }

  function drawOverlay(snapshot, status) {
    if (status === 'Running') {
      return
    }

    let message = ''
    let sub = 'Press Launch Ball to fire.'

    if (status === 'Paused') {
      message = 'Paused'
      sub = 'Press Start Session to continue.'
    } else if (status === 'Game Over') {
      message = 'Game Over'
      sub = 'Press Restart to play again.'
    } else {
      message = snapshot.ball.attached ? 'Ready' : 'Running'
    }

    context.fillStyle = 'rgba(2, 8, 23, 0.5)'
    context.fillRect(0, 0, snapshot.width, snapshot.height)

    context.fillStyle = '#e2e8f0'
    context.font = '700 26px Space Grotesk, sans-serif'
    context.textAlign = 'center'
    context.fillText(message, snapshot.width / 2, snapshot.height / 2 - 6)

    context.font = '500 14px Space Grotesk, sans-serif'
    context.fillStyle = '#bae6fd'
    context.fillText(sub, snapshot.width / 2, snapshot.height / 2 + 22)
  }

  function render(snapshot, status) {
    drawBackground(snapshot)
    drawBricks(snapshot)
    drawPaddle(snapshot)
    drawBall(snapshot)
    drawOverlay(snapshot, status)
  }

  return {
    render,
  }
}
