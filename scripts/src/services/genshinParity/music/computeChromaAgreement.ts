// How alike two signals' pitch classes read over the frames given: the mean dot product of each frame's twelve
// Classes, 1 when every frame names the same notes in the same balance. `lag` reads the first signal that many frames
// Later than the second, so a first signal sounding late agrees best at a positive lag
export const computeChromaAgreement = (
  firstClasses: Float32Array,
  secondClasses: Float32Array,
  frames: number[],
  lag: number,
): number => {
  let agreement = 0;
  for (const frame of frames)
    for (let pitchClass = 0; pitchClass < 12; pitchClass++)
      agreement += (firstClasses[(frame + lag) * 12 + pitchClass] ?? 0) * (secondClasses[frame * 12 + pitchClass] ?? 0);
  return agreement / Math.max(frames.length, 1);
};
