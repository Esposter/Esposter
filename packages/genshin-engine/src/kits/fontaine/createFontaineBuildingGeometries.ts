import type { FontaineBuildingGeometries } from "#src/models/kits/fontaine/FontaineBuildingGeometries";
import type { FontaineBuildingOptions } from "#src/models/kits/fontaine/FontaineBuildingOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";
import {
  ARCH_RADIAL_SEGMENTS,
  ARCH_RADIUS_RATIO,
  ARCH_SPRING_HEIGHT,
  ARCH_TUBE_RADIUS,
  ARCH_TUBULAR_SEGMENTS,
  AWNING_CLEARANCE,
  AWNING_DEPTH,
  AWNING_HEIGHT,
  AWNING_INSET,
  BALCONY_DEPTH,
  BALCONY_HEIGHT,
  BALCONY_INSET,
  BALCONY_SLAB_HEIGHT,
  CORNICE_HEIGHT,
  CORNICE_OVERHANG,
  DORMER_HEIGHT,
  DORMER_INSET,
  DORMER_PROJECTION,
  DORMER_SLOPE_POSITION,
  DORMER_WIDTH_RATIO,
  FLOWER_BOX_DEPTH,
  FLOWER_BOX_HEIGHT,
  FLOWER_BOX_INSET,
  GROUND_FLOOR_HEIGHT,
  LAMP_OFFSET,
  LAMP_POST_SECTIONS,
  LAMP_RADIAL_SEGMENTS,
  LANTERN_SIZE,
  MANSARD_LOWER_HEIGHT,
  MANSARD_LOWER_TAPER,
  MANSARD_UPPER_HEIGHT,
  MANSARD_UPPER_TAPER,
  RAIL_HEIGHT,
  RAIL_THICKNESS,
  SQUARE_CIRCUMRADIUS,
  STOREY_HEIGHT,
} from "#src/kits/fontaine/constants";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { CylinderGeometry, TorusGeometry } from "three";

// A four-sided frustum standing on the origin's plane at the given height, its base the given half sizes and its top
// that share of them, its sides flat and its corners on the diagonals
const createFrustumGeometry = (
  baseHalfWidth: number,
  baseHalfDepth: number,
  topTaper: number,
  baseY: number,
  height: number,
): BufferGeometry =>
  new CylinderGeometry(SQUARE_CIRCUMRADIUS * topTaper, SQUARE_CIRCUMRADIUS, height, 4)
    .rotateY(Math.PI / 4)
    .scale(baseHalfWidth, 1, baseHalfDepth)
    .translate(0, baseY + height / 2, 0);

// A Fontaine building as its stone, iron, gold, slate and awning, one geometry each, from its bays, depth and storeys:
// a solid stone block of arched ground floor and storeys, each storey capped by a gold cornice, every upper bay with a
// balcony of iron rails and a flower box, the mansard roof of two slopes with a dormer in each bay, an awning over each
// arch, and a lamp post either side of the front
export const createFontaineBuildingGeometries = ({
  bayCount,
  bayWidth,
  depth,
  storeyCount,
}: FontaineBuildingOptions): FontaineBuildingGeometries => {
  const halfWidth = (bayCount * bayWidth) / 2;
  const halfDepth = depth / 2;
  const frontZ = halfDepth;
  const archRadius = ARCH_RADIUS_RATIO * bayWidth;
  const roofBaseY = GROUND_FLOOR_HEIGHT + storeyCount * STOREY_HEIGHT;
  const stoneBoxes: number[][] = [[-halfWidth, 0, -halfDepth, halfWidth, GROUND_FLOOR_HEIGHT, halfDepth]];
  const goldBoxes: number[][] = [];
  const ironBoxes: number[][] = [];
  const slateBoxes: number[][] = [];
  const awningBoxes: number[][] = [];
  const archParts: BufferGeometry[] = [];
  const addCornice = (topY: number): void => {
    goldBoxes.push([
      -halfWidth - CORNICE_OVERHANG,
      topY,
      -halfDepth - CORNICE_OVERHANG,
      halfWidth + CORNICE_OVERHANG,
      topY + CORNICE_HEIGHT,
      halfDepth + CORNICE_OVERHANG,
    ]);
  };
  addCornice(GROUND_FLOOR_HEIGHT);

  for (let bayIndex = 0; bayIndex < bayCount; bayIndex++) {
    const bayStartX = -halfWidth + bayIndex * bayWidth;
    const bayCenterX = bayStartX + bayWidth / 2;
    archParts.push(
      new TorusGeometry(archRadius, ARCH_TUBE_RADIUS, ARCH_RADIAL_SEGMENTS, ARCH_TUBULAR_SEGMENTS, Math.PI).translate(
        bayCenterX,
        ARCH_SPRING_HEIGHT,
        frontZ,
      ),
    );
    const awningY = ARCH_SPRING_HEIGHT + archRadius + ARCH_TUBE_RADIUS + AWNING_CLEARANCE;
    awningBoxes.push([
      bayStartX + AWNING_INSET,
      awningY,
      frontZ,
      bayStartX + bayWidth - AWNING_INSET,
      awningY + AWNING_HEIGHT,
      frontZ + AWNING_DEPTH,
    ]);
  }

  for (let storeyIndex = 0; storeyIndex < storeyCount; storeyIndex++) {
    const storeyBaseY = GROUND_FLOOR_HEIGHT + storeyIndex * STOREY_HEIGHT;
    const storeyTopY = storeyBaseY + STOREY_HEIGHT;
    stoneBoxes.push([-halfWidth, storeyBaseY, -halfDepth, halfWidth, storeyTopY, halfDepth]);
    addCornice(storeyTopY);
    for (let bayIndex = 0; bayIndex < bayCount; bayIndex++) {
      const bayStartX = -halfWidth + bayIndex * bayWidth;
      const balconyStartX = bayStartX + BALCONY_INSET;
      const balconyEndX = bayStartX + bayWidth - BALCONY_INSET;
      const balconyOuterZ = frontZ + BALCONY_DEPTH;
      const slabTopY = storeyBaseY + BALCONY_HEIGHT + BALCONY_SLAB_HEIGHT;
      stoneBoxes.push([
        balconyStartX,
        storeyBaseY + BALCONY_HEIGHT,
        frontZ,
        balconyEndX,
        slabTopY,
        balconyOuterZ,
      ]);
      ironBoxes.push([
        balconyStartX,
        slabTopY,
        balconyOuterZ - RAIL_THICKNESS,
        balconyEndX,
        slabTopY + RAIL_HEIGHT,
        balconyOuterZ,
      ]);
      stoneBoxes.push([
        balconyStartX + FLOWER_BOX_INSET,
        slabTopY,
        balconyOuterZ - FLOWER_BOX_DEPTH,
        balconyEndX - FLOWER_BOX_INSET,
        slabTopY + FLOWER_BOX_HEIGHT,
        balconyOuterZ - RAIL_THICKNESS,
      ]);
    }
  }

  // The mansard's lower slope breaks at its height, the shallow upper one rising from there to the roof's top
  const dormerY = roofBaseY + MANSARD_LOWER_HEIGHT * DORMER_SLOPE_POSITION;
  const dormerSurfaceZ = halfDepth * (1 - (1 - MANSARD_LOWER_TAPER) * DORMER_SLOPE_POSITION);
  for (let bayIndex = 0; bayIndex < bayCount; bayIndex++) {
    const dormerCenterX = -halfWidth + (bayIndex + 0.5) * bayWidth;
    const dormerHalfWidth = (DORMER_WIDTH_RATIO * bayWidth) / 2;
    slateBoxes.push([
      dormerCenterX - dormerHalfWidth,
      dormerY,
      dormerSurfaceZ - DORMER_INSET,
      dormerCenterX + dormerHalfWidth,
      dormerY + DORMER_HEIGHT,
      dormerSurfaceZ + DORMER_PROJECTION,
    ]);
  }
  const roofParts = [
    createFrustumGeometry(halfWidth, halfDepth, MANSARD_LOWER_TAPER, roofBaseY, MANSARD_LOWER_HEIGHT),
    createFrustumGeometry(
      halfWidth * MANSARD_LOWER_TAPER,
      halfDepth * MANSARD_LOWER_TAPER,
      MANSARD_UPPER_TAPER,
      roofBaseY + MANSARD_LOWER_HEIGHT,
      MANSARD_UPPER_HEIGHT,
    ),
  ];

  // A lamp post stands at each front corner, its lantern on the post's head
  const lampPostGeometry = createLatheStackGeometry({
    isFaceted: false,
    radialSegments: LAMP_RADIAL_SEGMENTS,
    sections: LAMP_POST_SECTIONS,
  });
  const lampHeight = LAMP_POST_SECTIONS.reduce((height, { height: sectionHeight }) => height + sectionHeight, 0);
  const lampPostParts: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const lampX = side * (halfWidth + LAMP_OFFSET);
    const lampZ = frontZ + LAMP_OFFSET;
    lampPostParts.push(lampPostGeometry.clone().translate(lampX, 0, lampZ));
    goldBoxes.push([
      lampX - LANTERN_SIZE / 2,
      lampHeight,
      lampZ - LANTERN_SIZE / 2,
      lampX + LANTERN_SIZE / 2,
      lampHeight + LANTERN_SIZE,
      lampZ + LANTERN_SIZE / 2,
    ]);
  }
  lampPostGeometry.dispose();

  return {
    awningGeometry: createBoxesGeometry(awningBoxes),
    goldGeometry: mergeGeometryParts([createBoxesGeometry(goldBoxes), ...lampPostParts]),
    ironGeometry: createBoxesGeometry(ironBoxes),
    slateGeometry: mergeGeometryParts([...roofParts, createBoxesGeometry(slateBoxes)]),
    stoneGeometry: mergeGeometryParts([createBoxesGeometry(stoneBoxes), ...archParts]),
  };
};
