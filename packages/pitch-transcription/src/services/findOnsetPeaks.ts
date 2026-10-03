import { takeOne } from "@esposter/shared";

// Each frame and pitch whose onset reading passes the threshold and is larger than the frames on either side of it,
// In order of frame then pitch. The first and last frames have a side missing and are never a peak, as SciPy's
// `argrelmax` clips them in the model repository
export const findOnsetPeaks = (onsets: number[][], threshold: number): [number, number][] => {
  const peaks: [number, number][] = [];
  for (let frame = 1; frame < onsets.length - 1; frame++) {
    const previous = takeOne(onsets, frame - 1);
    const row = takeOne(onsets, frame);
    const next = takeOne(onsets, frame + 1);
    for (const [pitch, reading] of row.entries())
      if (reading > threshold && reading > takeOne(previous, pitch) && reading > takeOne(next, pitch))
        peaks.push([frame, pitch]);
  }
  return peaks;
};
