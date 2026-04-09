function getFullscreenElement() {
  return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

function requestElementFullscreen(element) {
  if (element.requestFullscreen) {
    return element.requestFullscreen()
  }

  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
    return Promise.resolve()
  }

  return Promise.reject(new Error('Fullscreen is not supported in this browser.'))
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen()
  }

  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
    return Promise.resolve()
  }

  return Promise.resolve()
}

export function mountFullscreenToggle({ button, target, label = 'Fullscreen' }) {
  if (!button || !target) {
    return {
      destroy: () => {},
    }
  }

  const supported = Boolean(target.requestFullscreen || target.webkitRequestFullscreen)

  if (!supported) {
    button.disabled = true
    button.textContent = `${label} N/A`

    return {
      destroy: () => {},
    }
  }

  function isActive() {
    return getFullscreenElement() === target
  }

  function updateButtonLabel() {
    button.textContent = isActive() ? `Exit ${label}` : label
    button.setAttribute('aria-pressed', String(isActive()))
  }

  async function toggle() {
    try {
      if (isActive()) {
        await exitFullscreen()
      } else {
        await requestElementFullscreen(target)
      }
    } finally {
      updateButtonLabel()
    }
  }

  button.addEventListener('click', toggle)
  document.addEventListener('fullscreenchange', updateButtonLabel)
  document.addEventListener('webkitfullscreenchange', updateButtonLabel)

  updateButtonLabel()

  return {
    destroy: () => {
      button.removeEventListener('click', toggle)
      document.removeEventListener('fullscreenchange', updateButtonLabel)
      document.removeEventListener('webkitfullscreenchange', updateButtonLabel)
    },
  }
}
