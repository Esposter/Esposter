import type { LiyueRoofTierOptions } from "#src/models/liyue/LiyueRoofTierOptions";

import {
  LIYUE_FINIAL_RADIAL_SEGMENTS,
  LIYUE_FINIAL_SECTIONS,
  LIYUE_ROOF_EAVE_CURL,
  LIYUE_ROOF_RIDGE_SCALE,
  LIYUE_ROOF_RING_COUNT,
  LIYUE_ROOF_SIDE_SEGMENTS,
  LIYUE_ROOF_TIER_HEIGHT,
} from "#src/services/liyue/constants";
import { createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";
import { BufferGeometry, Float32BufferAttribute } from "three";

// A square's sides, each from one corner to the next, as unit coordinates from -1 to 1 across the eave
const UNIT_SIDES: readonly (readonly [readonly [number, number], readonly [number, number]])[] = [
  [
    [-1, -1],
    [1, -1],
  ],
  [
    [1, -1],
    [1, 1],
  ],
  [
    [1, 1],
    [-1, 1],
  ],
  [
    [-1, 1],
    [-1, -1],
  ],
];
// The eave's perimeter, LIYUE_ROOF_SIDE_SEGMENTS points to a side, so every corner is one of its points
const UNIT_PERIMETER = UNIT_SIDES.flatMap(([from, to]) =>
  Array.from({ length: LIYUE_ROOF_SIDE_SEGMENTS }, (_value, step): [number, number] => {
    const progress = step / LIYUE_ROOF_SIDE_SEGMENTS;
    return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];
  }),
);
// One roof tier: a shell that rises from its eave to a flat top, its corners upturned, and a finial on each top corner.
// The rings step inward from the eave to the top, and the faces are wound so their normals point out and up
export const createLiyueRoofTierGeometry = ({ baseY, halfDepth, halfWidth }: LiyueRoofTierOptions): BufferGeometry => {
  const positions: number[] = [];
  const uvs: number[] = [];
  for (let ring = 0; ring <= LIYUE_ROOF_RING_COUNT; ring++) {
    const progress = ring / LIYUE_ROOF_RING_COUNT;
    const scale = 1 - progress * (1 - LIYUE_ROOF_RIDGE_SCALE);
    const rise = LIYUE_ROOF_TIER_HEIGHT * (1 - (1 - progress) ** 2);
    for (const [index, [unitX, unitZ]] of UNIT_PERIMETER.entries()) {
      const lift = (LIYUE_ROOF_EAVE_CURL * (unitX ** 2 + unitZ ** 2) * (1 - progress)) / 2;
      positions.push(unitX * halfWidth * scale, baseY + lift + rise, unitZ * halfDepth * scale);
      uvs.push(index / UNIT_PERIMETER.length, progress);
    }
  }
  const indices: number[] = [];
  const perimeterLength = UNIT_PERIMETER.length;
  for (let ring = 0; ring < LIYUE_ROOF_RING_COUNT; ring++)
    for (let side = 0; side < perimeterLength; side++) {
      const next = (side + 1) % perimeterLength;
      const lower = ring * perimeterLength + side;
      const lowerNext = ring * perimeterLength + next;
      const upper = (ring + 1) * perimeterLength + side;
      const upperNext = (ring + 1) * perimeterLength + next;
      indices.push(lower, upper, lowerNext, lowerNext, upper, upperNext);
    }
  const surfaceGeometry = new BufferGeometry();
  surfaceGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  surfaceGeometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  surfaceGeometry.setIndex(indices);
  surfaceGeometry.computeVertexNormals();

  const finialGeometries = UNIT_SIDES.map(([[unitX, unitZ]]) =>
    createLatheStackGeometry({
      isFaceted: false,
      radialSegments: LIYUE_FINIAL_RADIAL_SEGMENTS,
      sections: LIYUE_FINIAL_SECTIONS,
    }).translate(
      unitX * halfWidth * LIYUE_ROOF_RIDGE_SCALE,
      baseY + LIYUE_ROOF_TIER_HEIGHT,
      unitZ * halfDepth * LIYUE_ROOF_RIDGE_SCALE,
    ),
  );
  return mergeGeometryParts([surfaceGeometry, ...finialGeometries]);
};
