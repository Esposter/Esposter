// The sum of a call's delays, undefined when any of them is, as one the reader cannot evaluate leaves the call's delay
// Unknown
export const sumOptionalDelays = (delays: readonly (number | undefined)[]): number | undefined =>
  delays.reduce<number | undefined>(
    (sum, delay) => (sum === undefined || delay === undefined ? undefined : sum + delay),
    0,
  );
