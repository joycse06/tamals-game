export function createFrameLoop({ getStepMs, onStep }) {
  let running = false
  let rafId = 0
  let previousTime = 0
  let accumulator = 0

  function stop() {
    running = false
    previousTime = 0
    accumulator = 0

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  function tick(timestamp) {
    if (!running) {
      return
    }

    if (previousTime === 0) {
      previousTime = timestamp
    }

    accumulator += timestamp - previousTime
    previousTime = timestamp

    const stepMs = getStepMs()
    while (accumulator >= stepMs) {
      onStep()
      accumulator -= stepMs
      if (!running) {
        return
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  function start() {
    if (running) {
      return
    }

    running = true
    previousTime = 0
    accumulator = 0
    rafId = requestAnimationFrame(tick)
  }

  function isRunning() {
    return running
  }

  return {
    start,
    stop,
    isRunning,
  }
}
