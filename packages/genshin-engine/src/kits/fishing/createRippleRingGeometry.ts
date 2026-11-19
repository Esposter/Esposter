import type { RippleRingOptions } from "#src/models/kits/fishing/RippleRingOptions";
import type { BufferGeometry } from "three";

import { RingGeometry } from "three";

const RING_SEGMENTS = 32;

// A ring lying flat on the water at the origin, facing up, between its inner and outer radius
export const createRippleRingGeometry = ({ innerRadius, outerRadius }: RippleRingOptions): BufferGeometry =>
  new RingGeometry(innerRadius, outerRadius, RING_SEGMENTS).rotateX(-Math.PI / 2);
