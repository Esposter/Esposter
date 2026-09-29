// The signal Nuxt aborts a superseded or unmounted fetch with, joined with the caller's own when it passed one
export const mergeSignals = (signal: AbortSignal, callerSignal?: AbortSignal): AbortSignal =>
  callerSignal ? AbortSignal.any([signal, callerSignal]) : signal;
