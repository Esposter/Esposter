import type { GeoPoint } from "@/models/visual/GeoPoint";
import type { LandMask } from "@/models/visual/LandMask";

import { isLandAt } from "@/services/visual/globe/isLandAt";

// Rings of latitude, each spaced evenly in arc length, so the dots stay the same distance apart from the equator to the poles
export const createLandDots = (landMask: LandMask, spacing: number) => {
  const dots: GeoPoint[] = [];
  const ringCount = Math.round(180 / spacing);
  for (let ring = 0; ring < ringCount; ring++) {
    const lat = -90 + (ring + 0.5) * (180 / ringCount);
    const dotCount = Math.max(1, Math.round((360 * Math.cos((lat * Math.PI) / 180)) / spacing));
    for (let i = 0; i < dotCount; i++) {
      const lng = -180 + (i + 0.5) * (360 / dotCount);
      if (isLandAt(landMask, lat, lng)) dots.push({ lat, lng });
    }
  }
  return dots;
};
