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
      const handler = () => {
        const target = button.dataset.direction
        if (!target || !TAP_TO_DIRECTION[target]) {
          return
        }

        onDirection(TAP_TO_DIRECTION[target])
        onAction()
      }

      button.addEventListener('click', handler)
      cleanupFns.push(() => button.removeEventListener('click', handler))
    })
  }

  function destroy() {
    cleanupFns.forEach((cleanup) => cleanup())
    cleanupFns.length = 0
  }

  return {
    bindKeyboard,
    bindTouchButtons,
    destroy,
  }
}
