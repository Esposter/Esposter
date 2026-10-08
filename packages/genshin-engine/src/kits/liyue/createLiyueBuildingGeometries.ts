import type { LiyueBuildingGeometries } from "#src/models/kits/liyue/LiyueBuildingGeometries";
import type { LiyueBuildingOptions } from "#src/models/kits/liyue/LiyueBuildingOptions";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";
import {
  BEAM_SIZE,
  COLUMN_CAP_HEIGHT,
  COLUMN_CAPITAL_RADIUS,
  COLUMN_PLINTH_RADIUS,
  COLUMN_RADIAL_SEGMENTS,
  COLUMN_SHAFT_BOTTOM_RADIUS,
  COLUMN_SHAFT_TOP_RADIUS,
  LATTICE_SILL_HEIGHT,
  ROOF_OVERHANG,
  ROOF_TIER_HEIGHT,
  ROOF_TIER_SCALE,
  TERRACE_HEIGHT,
  TERRACE_MARGIN,
} from "#src/kits/liyue/constants";
import { createLiyueLatticeBoxes } from "#src/kits/liyue/createLiyueLatticeBoxes";
import { createLiyueRoofTierGeometry } from "#src/kits/liyue/createLiyueRoofTierGeometry";
import { createLiyueWallBox } from "#src/kits/liyue/createLiyueWallBox";
import { getLiyueBays } from "#src/kits/liyue/getLiyueBays";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";

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
  const wallTop = TERRACE_HEIGHT + storeyHeight;
  const beamBottom = wallTop - BEAM_SIZE;
  const sill = TERRACE_HEIGHT + LATTICE_SILL_HEIGHT;
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
      radialSegments: COLUMN_RADIAL_SEGMENTS,
      sections: [
        { bottomRadius: COLUMN_PLINTH_RADIUS, height: COLUMN_CAP_HEIGHT, topRadius: COLUMN_PLINTH_RADIUS },
        {
          bottomRadius: COLUMN_SHAFT_BOTTOM_RADIUS,
          height: storeyHeight - COLUMN_CAP_HEIGHT * 2,
          topRadius: COLUMN_SHAFT_TOP_RADIUS,
        },
        { bottomRadius: COLUMN_CAPITAL_RADIUS, height: COLUMN_CAP_HEIGHT, topRadius: COLUMN_CAPITAL_RADIUS },
      ],
    }).translate(x, TERRACE_HEIGHT, z),
  );
  const beamBoxes = [
    ...WALL_SIDES.map((side) =>
      createLiyueWallBox({
        bottom: beamBottom,
        end: halfWidth,
        face: side * halfDepth,
        isAlongX: true,
        start: -halfWidth,
        thickness: BEAM_SIZE,
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
        thickness: BEAM_SIZE,
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
  const terraceHalfWidth = halfWidth + TERRACE_MARGIN;
  const terraceHalfDepth = halfDepth + TERRACE_MARGIN;
  // Each tier's eave is the one below's scaled, and its base stands where the tier below's roof rises to
  const roofGeometries = Array.from({ length: roofTierCount }, (_, tier) => {
    const tierScale = ROOF_TIER_SCALE ** tier;
    return createLiyueRoofTierGeometry({
      baseY: wallTop + ROOF_TIER_HEIGHT * tier,
      halfDepth: (halfDepth + ROOF_OVERHANG) * tierScale,
      halfWidth: (halfWidth + ROOF_OVERHANG) * tierScale,
    });
  });
  return {
    lacquer: mergeGeometryParts([createBoxesGeometry([...beamBoxes, ...latticeBoxes]), ...columnGeometries]),
    roof: mergeGeometryParts(roofGeometries),
    stone: createBoxesGeometry([
      [-terraceHalfWidth, 0, -terraceHalfDepth, terraceHalfWidth, TERRACE_HEIGHT, terraceHalfDepth],
    ]),
  };
};
