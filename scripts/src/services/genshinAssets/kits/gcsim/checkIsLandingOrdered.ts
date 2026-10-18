// Whether each call lands strictly after the one before it, with a delay, so that their order is known. Calls of one
// Delay, or with none, have no order to merge by
export const checkIsLandingOrdered = (calls: readonly { delay?: number }[]): boolean =>
  calls.every(
    ({ delay }, index) =>
      delay !== undefined && (index === 0 || (calls[index - 1]?.delay ?? Number.POSITIVE_INFINITY) < delay),
  );
