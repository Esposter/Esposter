// Mulberry32: a seed to a stream of numbers from 0 up to 1, the same stream for the same seed
export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
};
