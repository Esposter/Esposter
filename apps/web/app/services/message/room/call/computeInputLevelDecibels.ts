import { MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

// The loudness of one analyser frame: the root mean square of its samples on the decibel scale, where silence has
// No logarithm and reads as the scale's floor
export const computeInputLevelDecibels = (timeDomainData: Float32Array) => {
  let sumSquares = 0;
  for (const sample of timeDomainData) sumSquares += sample * sample;
  const rootMeanSquare = Math.sqrt(sumSquares / timeDomainData.length);
  return rootMeanSquare > 0 ? 20 * Math.log10(rootMeanSquare) : MIN_INPUT_SENSITIVITY_DECIBELS;
};
