import type { StoneCircleOptions } from "#src/models/nod-krai/StoneCircleOptions";
import type { BufferGeometry } from "three";

import { mergeGeometryParts } from "genshin-engine";
import { BoxGeometry } from "three";

// A ring of standing stones, each turned so its thickness lies across the radius, merged into one geometry standing on
// the origin's ground plane
export const createStoneCircleGeometry = ({
  pillarCount,
  pillarHeight,
  pillarThickness,
  pillarWidth,
  radius,
}: StoneCircleOptions): BufferGeometry => {
  const parts = Array.from({ length: pillarCount }, (_, index) => {
    const angle = (index / pillarCount) * Math.PI * 2;
    return new BoxGeometry(pillarWidth, pillarHeight, pillarThickness)
      .rotateY(Math.PI / 2 - angle)
      .translate(radius * Math.cos(angle), pillarHeight / 2, radius * Math.sin(angle));
  });
  return mergeGeometryParts(parts);
};
