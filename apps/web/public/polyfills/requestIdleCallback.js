// An idle callback for a browser with none: run on the next turn of the event loop, telling the callback it has the
// Rest of a frame's fifty milliseconds a browser's own idle period gives at most. A native one is left alone
if (!("requestIdleCallback" in globalThis)) {
  const IDLE_PERIOD_MS = 50;
  globalThis.requestIdleCallback = (callback) => {
    const start = performance.now();
    return setTimeout(() => {
      callback({ didTimeout: false, timeRemaining: () => Math.max(0, IDLE_PERIOD_MS - (performance.now() - start)) });
    }, 1);
  };
  globalThis.cancelIdleCallback = (handle) => {
    clearTimeout(handle);
  };
}
