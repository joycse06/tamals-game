function drawPearl(context, pearl) {
  const gradient = context.createRadialGradient(
    pearl.x - pearl.radius * 0.2,
    pearl.y - pearl.radius * 0.2,
    pearl.radius * 0.2,
    pearl.x,
    pearl.y,
    pearl.radius,
  )

  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.65, '#dbeafe')
  gradient.addColorStop(1, '#93c5fd')

  context.fillStyle = gradient
  context.beginPath()
  context.arc(pearl.x, pearl.y, pearl.radius, 0, Math.PI * 2)
  context.fill()
}

function drawDiver(context, diver) {
  context.fillStyle = '#0f172a'
  context.beginPath()
  context.arc(diver.x, diver.y, diver.radius, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#67e8f9'
  context.beginPath()
  context.arc(diver.x + 2, diver.y - 1, diver.radius * 0.45, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = '#e2e8f0'
  context.fillRect(diver.x - 2, diver.y + diver.radius * 0.8, 4, 8)
}

function drawShark(context, shark) {
  const facingRight = shark.vx >= 0
  const bodyColor = '#0b1220'
  const bellyColor = '#475569'

  context.fillStyle = bodyColor
  context.beginPath()
  context.ellipse(shark.x, shark.y, shark.radius * 1.45, shark.radius * 0.82, 0, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = bellyColor
  context.beginPath()
  context.ellipse(
    shark.x + (facingRight ? -2 : 2),
    shark.y + shark.radius * 0.16,
    shark.radius * 0.92,
    shark.radius * 0.36,
    0,
    0,
    Math.PI * 2,
  )
  context.fill()

  context.fillStyle = bodyColor
  context.beginPath()
  if (facingRight) {
    context.moveTo(shark.x - shark.radius * 1.5, shark.y)
    context.lineTo(shark.x - shark.radius * 2.05, shark.y - shark.radius * 0.55)
    context.lineTo(shark.x - shark.radius * 2.05, shark.y + shark.radius * 0.55)
  } else {
    context.moveTo(shark.x + shark.radius * 1.5, shark.y)
    context.lineTo(shark.x + shark.radius * 2.05, shark.y - shark.radius * 0.55)
    context.lineTo(shark.x + shark.radius * 2.05, shark.y + shark.radius * 0.55)
  }
  context.closePath()
  context.fill()
}

export function createPearlDiverRenderer({ canvas }) {
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Pearl Diver requires canvas 2d support.')
  }

  function drawBackground(snapshot) {
    const sky = context.createLinearGradient(0, 0, 0, snapshot.waterline)
    sky.addColorStop(0, '#8be0ff')
    sky.addColorStop(1, '#d2f6ff')

    context.fillStyle = sky
    context.fillRect(0, 0, snapshot.width, snapshot.waterline)

    const sea = context.createLinearGradient(0, snapshot.waterline, 0, snapshot.height)
    sea.addColorStop(0, '#0ea5e9')
    sea.addColorStop(0.55, '#0284c7')
    sea.addColorStop(1, '#0f4c81')

    context.fillStyle = sea
    context.fillRect(0, snapshot.waterline, snapshot.width, snapshot.height - snapshot.waterline)

    context.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    context.lineWidth = 3
    context.beginPath()
    context.moveTo(0, snapshot.waterline + 1.5)
    context.lineTo(snapshot.width, snapshot.waterline + 1.5)
    context.stroke()

    context.fillStyle = '#334155'
    context.fillRect(0, snapshot.height - 16, snapshot.width, 16)
  }

  function drawBubbles(snapshot) {
    context.fillStyle = 'rgba(226, 232, 240, 0.42)'

    for (let i = 0; i < 18; i += 1) {
      const x = (i * 67 + snapshot.score * 7) % snapshot.width
      const y =
        snapshot.waterline +
        ((i * 37 + snapshot.score * 11) % Math.max(40, snapshot.height - snapshot.waterline - 24))
      const radius = 1.4 + (i % 3)

      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  function drawOverlay(snapshot, status) {
    if (status === 'Running') {
      return
    }

    let message = 'Ready to Dive'
    let subline = 'Swim underwater and collect pearls.'
    if (status === 'Paused') {
      message = 'Paused'
      subline = 'Press Start to keep collecting pearls.'
    }

    if (status === 'Game Over') {
      message = 'You Were Eaten'
      subline = 'A shark got you. Press Reset to dive again.'
    }

    context.fillStyle = 'rgba(2, 6, 23, 0.25)'
    context.fillRect(0, 0, snapshot.width, snapshot.height)

    context.fillStyle = '#f8fafc'
    context.textAlign = 'center'
    context.font = '700 28px Space Grotesk, sans-serif'
    context.fillText(message, snapshot.width / 2, snapshot.height / 2)

    context.font = '500 14px Space Grotesk, sans-serif'
    context.fillText(subline, snapshot.width / 2, snapshot.height / 2 + 24)
  }

  function render(snapshot, status) {
    drawBackground(snapshot)
    drawBubbles(snapshot)
    snapshot.pearls.forEach((pearl) => drawPearl(context, pearl))
    snapshot.sharks.forEach((shark) => drawShark(context, shark))
    drawDiver(context, snapshot.diver)
    drawOverlay(snapshot, status)
  }

  return {
    render,
  }
}
