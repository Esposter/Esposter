export const getConcurrentFunction = <T extends unknown[]>(
  fn: (checkIsStale: () => boolean, ...args: T) => Promise<void>,
) => {
  let callId = 0;
  return (...args: T): Promise<void> => {
    const id = ++callId;
    return fn(() => id !== callId, ...args);
  };
};
