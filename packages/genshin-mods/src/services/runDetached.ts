// The engine's timer and hook slots take no promise, so an action run from one floats. Every action run through here
// Resolves each of its outcomes rather than rejecting, which is what lets the floating stand
export const runDetached = (action: () => Promise<void>): void => {
  // oxlint-disable-next-line typescript/no-floating-promises -- The engine's timer and hook slots take no promise, and every action run through here resolves each of its outcomes
  action();
};
