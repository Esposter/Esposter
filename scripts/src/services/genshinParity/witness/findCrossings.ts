import type { Crossing } from "#src/models/genshinParity/witness/Crossing";

// The share of a signal's frames under its low level and over its high one, whose middle is the threshold an edge
// Crosses: a landmark passing a column turns it from one brightness to another, whatever share of the time it covers
const LEVEL_SHARE = 0.1;
// A crossing's moment interpolated between two frames is off by at most the time between them, spread evenly over it,
// Whose standard deviation is that time over the root of twelve: a recording's still stretches repeat their frames
// Byte for byte, so no noise read off its frames would bound it
const EVEN_SPREAD_DEVIATION = 1 / Math.sqrt(12);
// Where a signal sampled at its own times crosses the middle of its low and high levels, each crossing's moment
// Interpolated between its two frames, with its uncertainty in seconds
export const findCrossings = (values: readonly number[], times: readonly number[]): Crossing[] => {
  const sorted = values.toSorted((firstValue, secondValue) => firstValue - secondValue);
  const low = sorted[Math.floor(sorted.length * LEVEL_SHARE)] ?? 0;
  const high = sorted[Math.floor(sorted.length * (1 - LEVEL_SHARE))] ?? 0;
  const threshold = (low + high) / 2;
  return values.slice(1).flatMap((value, index) => {
    const previous = values[index] ?? 0;
    const [previousTime = 0, time = 0] = [times[index], times[index + 1]];
    if (previous >= threshold === value >= threshold) return [];
    const share = (previous - threshold) / (previous - value);
    return [
      {
        isFalling: value < previous,
        time: previousTime + share * (time - previousTime),
        uncertainty: (time - previousTime) * EVEN_SPREAD_DEVIATION,
      },
    ];
  });
};
