export function createPersistentNumberStore(key, defaultValue = 0) {
  function read() {
    const raw = window.localStorage.getItem(key)
    if (raw === null) {
      return defaultValue
    }

    const parsed = Number.parseInt(raw, 10)
    return Number.isNaN(parsed) ? defaultValue : parsed
  }

  function write(value) {
    window.localStorage.setItem(key, String(value))
  }

  return {
    read,
    write,
  }
}
