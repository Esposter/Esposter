import type { SplashGeometryOptions } from "#src/models/kits/fishing/SplashGeometryOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { createRippleRingGeometry } from "#src/kits/fishing/createRippleRingGeometry";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";

// The ring's hollow starts at this share of the splash's radius, so the ring spreads out from a gap
const SPLASH_INNER_RADIUS_SHARE = 0.6;
// Each droplet rises to this many of its own sizes above the water
const DROPLET_RISE = 3;

// A splash as one ring on the water and a burst of droplets standing up from it, evenly round the ring, on the origin
export const createSplashGeometry = ({ dropletCount, dropletSize, radius }: SplashGeometryOptions): BufferGeometry => {
  const droplets = Array.from({ length: dropletCount }, (_value, index) => {
    const angle = (index / dropletCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const halfSize = dropletSize / 2;
    return [x - halfSize, 0, z - halfSize, x + halfSize, dropletSize * DROPLET_RISE, z + halfSize];
  });
  return mergeGeometryParts([
    createRippleRingGeometry({ innerRadius: radius * SPLASH_INNER_RADIUS_SHARE, outerRadius: radius }),
    createBoxesGeometry(droplets),
  ]);
};
