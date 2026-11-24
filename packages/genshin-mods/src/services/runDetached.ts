// The engine's timer and hook slots take no promise, so an action run from one floats.
// Every action run through here resolves each of its outcomes rather than rejecting.
// That is what lets the floating stand.
export const runDetached = (action: () => Promise<void>): void => {
  // Nothing awaits the action, as the slot takes no promise.
  // oxlint-disable-next-line typescript/no-floating-promises -- the action resolves each of its outcomes itself
  action();
};
