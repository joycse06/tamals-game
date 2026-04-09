const CODE_TO_DIRECTION = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
}

const TAP_TO_DIRECTION = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export function createDirectionalInput({ onDirection, onAction }) {
  const cleanupFns = []

  function handleKeyboard(event) {
    const nextDirection = CODE_TO_DIRECTION[event.code]
    if (!nextDirection) {
      return
    }

    event.preventDefault()
    onDirection(nextDirection)
    onAction()
  }

  function bindKeyboard() {
    window.addEventListener('keydown', handleKeyboard)
    cleanupFns.push(() => window.removeEventListener('keydown', handleKeyboard))
  }

  function bindTouchButtons(buttons) {
    buttons.forEach((button) => {
      const handler = (event) => {
        event.preventDefault()
        const target = button.dataset.direction
        if (!target || !TAP_TO_DIRECTION[target]) {
          return
        }

        onDirection(TAP_TO_DIRECTION[target])
        onAction()
      }

      button.addEventListener('pointerdown', handler)
      cleanupFns.push(() => button.removeEventListener('pointerdown', handler))
    })
  }

  function bindTapSurface(surface) {
    const handler = (event) => {
      if (event.pointerType === 'mouse') {
        return
      }

      event.preventDefault()
      onAction()
    }

    surface.addEventListener('pointerdown', handler)
    cleanupFns.push(() => surface.removeEventListener('pointerdown', handler))
  }

  function bindSwipeSurface(surface, minDistance = 24) {
    let pointerId = null
    let startX = 0
    let startY = 0

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse') {
        return
      }

      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      event.preventDefault()
    }

    const onPointerUp = (event) => {
      if (pointerId === null || event.pointerId !== pointerId) {
        return
      }

      pointerId = null
      const dx = event.clientX - startX
      const dy = event.clientY - startY
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)

      if (Math.max(absX, absY) < minDistance) {
        onAction()
        return
      }

      const direction =
        absX > absY
          ? dx > 0
            ? TAP_TO_DIRECTION.right
            : TAP_TO_DIRECTION.left
          : dy > 0
            ? TAP_TO_DIRECTION.down
            : TAP_TO_DIRECTION.up

      onDirection(direction)
      onAction()
      event.preventDefault()
    }

    const onPointerCancel = (event) => {
      if (pointerId !== null && event.pointerId === pointerId) {
        pointerId = null
      }
    }

    surface.addEventListener('pointerdown', onPointerDown)
    surface.addEventListener('pointerup', onPointerUp)
    surface.addEventListener('pointercancel', onPointerCancel)
    cleanupFns.push(() => surface.removeEventListener('pointerdown', onPointerDown))
    cleanupFns.push(() => surface.removeEventListener('pointerup', onPointerUp))
    cleanupFns.push(() => surface.removeEventListener('pointercancel', onPointerCancel))
  }

  function bindHoldButtons(buttons, onHoldState) {
    const releaseEvents = ['pointerup', 'pointercancel', 'pointerleave']

    buttons.forEach((button) => {
      const direction = button.dataset.direction
      if (!direction || !TAP_TO_DIRECTION[direction]) {
        return
      }

      const downHandler = (event) => {
        event.preventDefault()
        onHoldState(direction, true)
        onAction()
      }

      const upHandler = (event) => {
        event.preventDefault()
        onHoldState(direction, false)
      }

      button.addEventListener('pointerdown', downHandler)
      cleanupFns.push(() => button.removeEventListener('pointerdown', downHandler))

      releaseEvents.forEach((name) => {
        button.addEventListener(name, upHandler)
        cleanupFns.push(() => button.removeEventListener(name, upHandler))
      })
    })
  }

  function destroy() {
    cleanupFns.forEach((cleanup) => cleanup())
    cleanupFns.length = 0
  }

  return {
    bindKeyboard,
    bindTouchButtons,
    bindTapSurface,
    bindSwipeSurface,
    bindHoldButtons,
    destroy,
  }
}
