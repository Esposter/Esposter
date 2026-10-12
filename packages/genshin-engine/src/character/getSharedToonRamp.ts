import type { DataTexture } from "three";

import { SHARED_TOON_RAMP_SHADES } from "#src/character/constants";
import { createRampTexture } from "#src/materials/createRampTexture";

let sharedToonRamps: DataTexture[] | undefined;

// One of MMD's shared toon ramps by its index in a file, generated once for the world's own tones, and undefined past
// The ten a file can name
export const getSharedToonRamp = (toonIndex: number): DataTexture | undefined => {
  sharedToonRamps ??= SHARED_TOON_RAMP_SHADES.map((shade) =>
    createRampTexture({ resolution: 64, shade, softness: 0.08, terminator: 0.52 }),
  );
  return sharedToonRamps.at(toonIndex);
};
