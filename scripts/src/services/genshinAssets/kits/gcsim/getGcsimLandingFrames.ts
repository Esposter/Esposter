import type { GcsimTravel } from "#src/models/genshinAssets/kits/gcsim/GcsimTravel";

// A hitmark as its hit lands, after the travel of a projectile released at it
export const getGcsimLandingFrames = (
  travelMap: ReadonlyMap<string, GcsimTravel>,
  hitmarkName: string,
  hitmark: number,
): number => hitmark + (travelMap.get(hitmarkName)?.frames ?? 0);
