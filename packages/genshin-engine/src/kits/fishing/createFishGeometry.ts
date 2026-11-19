import type { FishGeometryOptions } from "#src/models/kits/fishing/FishGeometryOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";

// The body's width across the back, as a share of its depth, so a fish stands taller than it is wide
const BODY_WIDTH_SHARE = 0.4;
// The tail's fork is thinner than the body, and the dorsal fin stands up from the back at this share of the depth
const TAIL_THICKNESS_SHARE = 0.2;
const FIN_HEIGHT_SHARE = 0.5;
const FIN_THICKNESS = 0.02;
const TAIL_LENGTH_SHARE = 0.4;

// A fish as a body of boxes with a forked tail and a dorsal fin, nose toward -z, standing on the origin at its middle
export const createFishGeometry = ({ bodyDepth, bodyLength, tailSpread }: FishGeometryOptions): BufferGeometry => {
  const halfWidth = (bodyDepth * BODY_WIDTH_SHARE) / 2;
  const halfDepth = bodyDepth / 2;
  const halfLength = bodyLength / 2;
  const tailLength = bodyLength * TAIL_LENGTH_SHARE;
  const halfTail = (tailSpread * TAIL_THICKNESS_SHARE) / 2;
  const halfSpread = tailSpread / 2;
  return createBoxesGeometry([
    [-halfWidth, -halfDepth, -halfLength, halfWidth, halfDepth, halfLength],
    [-halfTail, -halfSpread, halfLength, halfTail, halfSpread, halfLength + tailLength],
    [-FIN_THICKNESS, halfDepth, -halfLength / 2, FIN_THICKNESS, halfDepth * (1 + FIN_HEIGHT_SHARE), halfLength / 2],
  ]);
};
