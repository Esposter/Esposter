import { computeMixBandDistance } from "#src/services/genshinAssets/music/computeMixBandDistance";
import { SAMPLED_VOICE_REFINE_STEPS } from "#src/services/genshinAssets/shared/constants";

// Each voice's power refined against the score's own band distance from a least-squares start: a voice's power doubled
// Or halved while that lowers the distance, the step halving each time no voice moves, down to
// `SAMPLED_VOICE_REFINE_STEPS` halvings. A silenced voice starts from a thousandth of the loudest, where a step can move
// It
export const refineVoicePowers = (
  voiceEnergies: Float64Array[],
  powers: number[],
  targets: Float64Array,
  floors: number[],
  frameCount: number,
): number[] => {
  const readDistance = (candidate: number[]) =>
    computeMixBandDistance(voiceEnergies, candidate, targets, floors, frameCount);
  let refined = powers.map((power) => Math.max(power, Math.max(...powers) / 1000));
  let distance = readDistance(refined);
  for (let step = 1; step >= 2 ** -SAMPLED_VOICE_REFINE_STEPS; step /= 2) {
    let isMoved = true;
    while (isMoved) {
      isMoved = false;
      for (const voice of refined.keys())
        for (const direction of [1, -1]) {
          const candidate = refined.map((power, index) => (index === voice ? power * 2 ** (direction * step) : power));
          const candidateDistance = readDistance(candidate);
          if (candidateDistance >= distance) continue;
          refined = candidate;
          distance = candidateDistance;
          isMoved = true;
        }
    }
  }
  return refined;
};
