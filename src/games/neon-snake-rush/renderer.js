function cellToPixel(cell, cellSize) {
  return cell * cellSize
}

export function createNeonSnakeRenderer({ canvas }) {
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Neon Snake Rush requires canvas 2d support.')
  }

  function drawGridBoard({ gridSize, cellSize, boardPixels }) {
    const gradient = context.createLinearGradient(0, 0, boardPixels, boardPixels)
    gradient.addColorStop(0, '#031f2a')
    gradient.addColorStop(1, '#062c3a')

    context.fillStyle = gradient
    context.fillRect(0, 0, boardPixels, boardPixels)

    context.strokeStyle = 'rgba(123, 234, 255, 0.09)'
    context.lineWidth = 1

    for (let i = 1; i < gridSize; i += 1) {
      const offset = i * cellSize + 0.5
      context.beginPath()
      context.moveTo(offset, 0)
      context.lineTo(offset, boardPixels)
      context.stroke()

      context.beginPath()
      context.moveTo(0, offset)
      context.lineTo(boardPixels, offset)
      context.stroke()
    }
  }

  function drawFood(snapshot, cellSize) {
    const centerX = cellToPixel(snapshot.food.x, cellSize) + cellSize / 2
    const centerY = cellToPixel(snapshot.food.y, cellSize) + cellSize / 2
    const radius = cellSize * 0.32

    context.beginPath()
    context.fillStyle = '#f97316'
    context.shadowColor = 'rgba(249, 115, 22, 0.7)'
    context.shadowBlur = 16
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.fill()
    context.shadowBlur = 0
  }

  function drawSnake(snapshot, cellSize) {
    for (let i = snapshot.snake.length - 1; i >= 0; i -= 1) {
      const segment = snapshot.snake[i]
      const x = cellToPixel(segment.x, cellSize)
      const y = cellToPixel(segment.y, cellSize)
      const inset = 2

      context.fillStyle = i === 0 ? '#5eead4' : '#14b8a6'
      context.shadowColor = i === 0 ? 'rgba(94, 234, 212, 0.8)' : 'rgba(20, 184, 166, 0.45)'
      context.shadowBlur = i === 0 ? 11 : 8
      context.fillRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2)
      context.shadowBlur = 0
    }

    const head = snapshot.snake[0]
    const eyeOffsetX =
      snapshot.direction.x === 0
        ? cellSize * 0.24
        : snapshot.direction.x > 0
          ? cellSize * 0.62
          : cellSize * 0.28
    const eyeOffsetY =
      snapshot.direction.y === 0
        ? cellSize * 0.28
        : snapshot.direction.y > 0
          ? cellSize * 0.62
          : cellSize * 0.24

    context.fillStyle = '#022c22'
    context.fillRect(
      cellToPixel(head.x, cellSize) + eyeOffsetX,
      cellToPixel(head.y, cellSize) + eyeOffsetY,
      3,
      3,
    )
  }

  function render(snapshot) {
    const cellSize = Math.floor(canvas.width / snapshot.gridSize)
    const boardPixels = cellSize * snapshot.gridSize

    drawGridBoard({ gridSize: snapshot.gridSize, cellSize, boardPixels })
    drawFood(snapshot, cellSize)
    drawSnake(snapshot, cellSize)
  }

  return {
    render,
  }
}
