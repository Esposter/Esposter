import type { CloudBandOptions } from "#src/atmosphere/CloudBandOptions";

import { createSeededRandom } from "#src/random/createSeededRandom";

// Where each cloud of a band stands, how wide it is and which painted cloud it is: spread evenly over the ring of
// Ground between the band's distances, as far out as near in, at a height and width drawn between its own, the same
// Clouds in the same places for the same seed, each one of the band's `spriteCount` painted clouds
export const placeCloudBand = (
  { count, distanceRange: [near, far], heightRange: [low, high], seed, widthRange: [narrow, wide] }: CloudBandOptions,
  spriteCount: number,
): { position: [number, number, number]; spriteIndex: number; width: number }[] => {
  const random = createSeededRandom(seed);
  return Array.from({ length: count }, () => {
    const angle = random() * Math.PI * 2;
    // Drawn by area, so the ring's far edge holds as many clouds to its length as its near edge does
    const distance = Math.sqrt(near ** 2 + random() * (far ** 2 - near ** 2));
    const height = low + random() * (high - low);
    return {
      position: [Math.cos(angle) * distance, height, Math.sin(angle) * distance],
      spriteIndex: Math.floor(random() * spriteCount),
      width: narrow + random() * (wide - narrow),
    };
  });
};
