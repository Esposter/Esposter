import type { RodGeometryOptions } from "#src/models/kits/fishing/RodGeometryOptions";
import type { BufferGeometry } from "three";

import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";

const ROD_SECTIONS = 6;
const ROD_RADIAL_SEGMENTS = 8;

// A rod as a faceted shaft stacked from its butt to its tip, each section narrower than the one below it, standing on
// The origin at its butt
export const createRodGeometry = ({ baseRadius, length, tipRadius }: RodGeometryOptions): BufferGeometry => {
  const sectionHeight = length / ROD_SECTIONS;
  const radiusAt = (share: number) => baseRadius + (tipRadius - baseRadius) * share;
  const sections = Array.from({ length: ROD_SECTIONS }, (_value, index) => ({
    bottomRadius: radiusAt(index / ROD_SECTIONS),
    height: sectionHeight,
    topRadius: radiusAt((index + 1) / ROD_SECTIONS),
  }));
  return createLatheStackGeometry({ isFaceted: true, radialSegments: ROD_RADIAL_SEGMENTS, sections });
};
