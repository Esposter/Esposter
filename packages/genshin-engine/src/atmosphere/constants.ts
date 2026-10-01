// The smoothstep a sky with no gradient of its own falls by, as 33 samples
const DEFAULT_SAMPLE_COUNT = 33;
export const DEFAULT_SKY_GRADIENT: { green: number[]; red: number[] } = {
  green: Array.from({ length: DEFAULT_SAMPLE_COUNT }, () => 0),
  red: Array.from({ length: DEFAULT_SAMPLE_COUNT }, (_, index) => {
    const share = index / (DEFAULT_SAMPLE_COUNT - 1);
    return 1 - share * share * (3 - 2 * share);
  }),
};
