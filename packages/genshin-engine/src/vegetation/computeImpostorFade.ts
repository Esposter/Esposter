import { IMPOSTOR_CROSSFADE_SHARE, IMPOSTOR_SWITCH_HEIGHTS } from "#src/vegetation/constants";
import { MathUtils } from "three";

// How much of a tree's impostor shows at a distance from the eye, from 0 for its mesh to 1 for the impostor alone. The
// Switch stands `IMPOSTOR_SWITCH_HEIGHTS` of the impostor's heights out, and the crossfade is a band
// `IMPOSTOR_CROSSFADE_SHARE` of that distance wide centred on it
export const computeImpostorFade = (distance: number, impostorHeight: number): number => {
  const switchDistance = impostorHeight * IMPOSTOR_SWITCH_HEIGHTS;
  const halfBand = (switchDistance * IMPOSTOR_CROSSFADE_SHARE) / 2;
  return MathUtils.smoothstep(distance, switchDistance - halfBand, switchDistance + halfBand);
};
