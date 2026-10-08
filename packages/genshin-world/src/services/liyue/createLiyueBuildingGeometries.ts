import type { LiyueBuildingGeometries } from "#src/models/liyue/LiyueBuildingGeometries";
import type { LiyueBuildingOptions } from "#src/models/liyue/LiyueBuildingOptions";

import {
  LIYUE_BEAM_SIZE,
  LIYUE_COLUMN_CAP_HEIGHT,
  LIYUE_COLUMN_CAPITAL_RADIUS,
  LIYUE_COLUMN_PLINTH_RADIUS,
  LIYUE_COLUMN_RADIAL_SEGMENTS,
  LIYUE_COLUMN_SHAFT_BOTTOM_RADIUS,
  LIYUE_COLUMN_SHAFT_TOP_RADIUS,
  LIYUE_LATTICE_SILL_HEIGHT,
  LIYUE_ROOF_OVERHANG,
  LIYUE_ROOF_TIER_HEIGHT,
  LIYUE_ROOF_TIER_SCALE,
  LIYUE_TERRACE_HEIGHT,
  LIYUE_TERRACE_MARGIN,
} from "#src/services/liyue/constants";
import { createLiyueLatticeBoxes } from "#src/services/liyue/createLiyueLatticeBoxes";
import { createLiyueRoofTierGeometry } from "#src/services/liyue/createLiyueRoofTierGeometry";
import { createLiyueWallBox } from "#src/services/liyue/createLiyueWallBox";
import { getLiyueBays } from "#src/services/liyue/getLiyueBays";
import { createBoxesGeometry, createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";

const WALL_SIDES = [-1, 1];
// A Liyue building as a stone terrace, red columns, beams and lattice, and one to three roof tiers, each upturned
// At its eaves and topped with ridge ornaments, merged into one geometry per material. It stands on the origin, its
// Terrace on the ground and its walls rising from the terrace
export const createLiyueBuildingGeometries = ({
  depth,
  roofTierCount,
  storeyHeight,
  width,
}: LiyueBuildingOptions): LiyueBuildingGeometries => {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const wallTop = LIYUE_TERRACE_HEIGHT + storeyHeight;
  const beamBottom = wallTop - LIYUE_BEAM_SIZE;
  const sill = LIYUE_TERRACE_HEIGHT + LIYUE_LATTICE_SILL_HEIGHT;
  const xBays = getLiyueBays(width);
  const zBays = getLiyueBays(depth);
  // The front and back walls carry a column at every bay's start and at their far end, the sides only between corners
  const columns = [
    ...[...xBays.map(({ start }) => start), halfWidth].flatMap((x) => [
      { x, z: -halfDepth },
      { x, z: halfDepth },
    ]),
    ...zBays.slice(1).flatMap(({ start: z }) => [
      { x: -halfWidth, z },
      { x: halfWidth, z },
    ]),
  ];
  const columnGeometries = columns.map(({ x, z }) =>
    createLatheStackGeometry({
      isFaceted: false,
      radialSegments: LIYUE_COLUMN_RADIAL_SEGMENTS,
      sections: [
        {
          bottomRadius: LIYUE_COLUMN_PLINTH_RADIUS,
          height: LIYUE_COLUMN_CAP_HEIGHT,
          topRadius: LIYUE_COLUMN_PLINTH_RADIUS,
        },
        {
          bottomRadius: LIYUE_COLUMN_SHAFT_BOTTOM_RADIUS,
          height: storeyHeight - LIYUE_COLUMN_CAP_HEIGHT * 2,
          topRadius: LIYUE_COLUMN_SHAFT_TOP_RADIUS,
        },
        {
          bottomRadius: LIYUE_COLUMN_CAPITAL_RADIUS,
          height: LIYUE_COLUMN_CAP_HEIGHT,
          topRadius: LIYUE_COLUMN_CAPITAL_RADIUS,
        },
      ],
    }).translate(x, LIYUE_TERRACE_HEIGHT, z),
  );
  const beamBoxes = [
    ...WALL_SIDES.map((side) =>
      createLiyueWallBox({
        bottom: beamBottom,
        end: halfWidth,
        face: side * halfDepth,
        isAlongX: true,
        start: -halfWidth,
        thickness: LIYUE_BEAM_SIZE,
        top: wallTop,
      }),
    ),
    ...WALL_SIDES.map((side) =>
      createLiyueWallBox({
        bottom: beamBottom,
        end: halfDepth,
        face: side * halfWidth,
        isAlongX: false,
        start: -halfDepth,
        thickness: LIYUE_BEAM_SIZE,
        top: wallTop,
      }),
    ),
  ];
  const latticeBoxes = [
    ...xBays.flatMap((bay) =>
      WALL_SIDES.flatMap((side) =>
        createLiyueLatticeBoxes({ ...bay, face: side * halfDepth, head: beamBottom, isAlongX: true, sill }),
      ),
    ),
    ...zBays.flatMap((bay) =>
      WALL_SIDES.flatMap((side) =>
        createLiyueLatticeBoxes({ ...bay, face: side * halfWidth, head: beamBottom, isAlongX: false, sill }),
      ),
    ),
  ];
  const terraceHalfWidth = halfWidth + LIYUE_TERRACE_MARGIN;
  const terraceHalfDepth = halfDepth + LIYUE_TERRACE_MARGIN;
  // Each tier's eave is the one below's scaled, and its base stands where the tier below's roof rises to
  const roofGeometries = Array.from({ length: roofTierCount }, (_, tier) => {
    const tierScale = LIYUE_ROOF_TIER_SCALE ** tier;
    return createLiyueRoofTierGeometry({
      baseY: wallTop + LIYUE_ROOF_TIER_HEIGHT * tier,
      halfDepth: (halfDepth + LIYUE_ROOF_OVERHANG) * tierScale,
      halfWidth: (halfWidth + LIYUE_ROOF_OVERHANG) * tierScale,
    });
  });
  return {
    lacquer: mergeGeometryParts([createBoxesGeometry([...beamBoxes, ...latticeBoxes]), ...columnGeometries]),
    roof: mergeGeometryParts(roofGeometries),
    stone: createBoxesGeometry([
      [-terraceHalfWidth, 0, -terraceHalfDepth, terraceHalfWidth, LIYUE_TERRACE_HEIGHT, terraceHalfDepth],
    ]),
  };
};
