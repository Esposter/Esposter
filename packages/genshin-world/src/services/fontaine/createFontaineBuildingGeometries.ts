import type { FontaineBuildingGeometries } from "#src/models/fontaine/FontaineBuildingGeometries";
import type { FontaineBuildingOptions } from "#src/models/fontaine/FontaineBuildingOptions";
import type { BufferGeometry } from "three";

import {
  FONTAINE_ARCH_RADIAL_SEGMENTS,
  FONTAINE_ARCH_RADIUS_RATIO,
  FONTAINE_ARCH_SPRING_HEIGHT,
  FONTAINE_ARCH_TUBE_RADIUS,
  FONTAINE_ARCH_TUBULAR_SEGMENTS,
  FONTAINE_AWNING_CLEARANCE,
  FONTAINE_AWNING_DEPTH,
  FONTAINE_AWNING_HEIGHT,
  FONTAINE_AWNING_INSET,
  FONTAINE_BALCONY_DEPTH,
  FONTAINE_BALCONY_HEIGHT,
  FONTAINE_BALCONY_INSET,
  FONTAINE_BALCONY_SLAB_HEIGHT,
  FONTAINE_CORNICE_HEIGHT,
  FONTAINE_CORNICE_OVERHANG,
  FONTAINE_DORMER_HEIGHT,
  FONTAINE_DORMER_INSET,
  FONTAINE_DORMER_PROJECTION,
  FONTAINE_DORMER_SLOPE_POSITION,
  FONTAINE_DORMER_WIDTH_RATIO,
  FONTAINE_FLOWER_BOX_DEPTH,
  FONTAINE_FLOWER_BOX_HEIGHT,
  FONTAINE_FLOWER_BOX_INSET,
  FONTAINE_GROUND_FLOOR_HEIGHT,
  FONTAINE_LAMP_OFFSET,
  FONTAINE_LAMP_POST_SECTIONS,
  FONTAINE_LAMP_RADIAL_SEGMENTS,
  FONTAINE_LANTERN_SIZE,
  FONTAINE_MANSARD_LOWER_HEIGHT,
  FONTAINE_MANSARD_LOWER_TAPER,
  FONTAINE_MANSARD_UPPER_HEIGHT,
  FONTAINE_MANSARD_UPPER_TAPER,
  FONTAINE_RAIL_HEIGHT,
  FONTAINE_RAIL_THICKNESS,
  FONTAINE_SQUARE_CIRCUMRADIUS,
  FONTAINE_STOREY_HEIGHT,
} from "#src/services/fontaine/constants";
import { createBoxesGeometry, createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";
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
  new CylinderGeometry(FONTAINE_SQUARE_CIRCUMRADIUS * topTaper, FONTAINE_SQUARE_CIRCUMRADIUS, height, 4)
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
  const archRadius = FONTAINE_ARCH_RADIUS_RATIO * bayWidth;
  const roofBaseY = FONTAINE_GROUND_FLOOR_HEIGHT + storeyCount * FONTAINE_STOREY_HEIGHT;
  const stoneBoxes: number[][] = [[-halfWidth, 0, -halfDepth, halfWidth, FONTAINE_GROUND_FLOOR_HEIGHT, halfDepth]];
  const goldBoxes: number[][] = [];
  const ironBoxes: number[][] = [];
  const slateBoxes: number[][] = [];
  const awningBoxes: number[][] = [];
  const archParts: BufferGeometry[] = [];
  const addCornice = (topY: number): void => {
    goldBoxes.push([
      -halfWidth - FONTAINE_CORNICE_OVERHANG,
      topY,
      -halfDepth - FONTAINE_CORNICE_OVERHANG,
      halfWidth + FONTAINE_CORNICE_OVERHANG,
      topY + FONTAINE_CORNICE_HEIGHT,
      halfDepth + FONTAINE_CORNICE_OVERHANG,
    ]);
  };
  addCornice(FONTAINE_GROUND_FLOOR_HEIGHT);

  for (let bayIndex = 0; bayIndex < bayCount; bayIndex++) {
    const bayStartX = -halfWidth + bayIndex * bayWidth;
    const bayCenterX = bayStartX + bayWidth / 2;
    archParts.push(
      new TorusGeometry(
        archRadius,
        FONTAINE_ARCH_TUBE_RADIUS,
        FONTAINE_ARCH_RADIAL_SEGMENTS,
        FONTAINE_ARCH_TUBULAR_SEGMENTS,
        Math.PI,
      ).translate(bayCenterX, FONTAINE_ARCH_SPRING_HEIGHT, frontZ),
    );
    const awningY = FONTAINE_ARCH_SPRING_HEIGHT + archRadius + FONTAINE_ARCH_TUBE_RADIUS + FONTAINE_AWNING_CLEARANCE;
    awningBoxes.push([
      bayStartX + FONTAINE_AWNING_INSET,
      awningY,
      frontZ,
      bayStartX + bayWidth - FONTAINE_AWNING_INSET,
      awningY + FONTAINE_AWNING_HEIGHT,
      frontZ + FONTAINE_AWNING_DEPTH,
    ]);
  }

  for (let storeyIndex = 0; storeyIndex < storeyCount; storeyIndex++) {
    const storeyBaseY = FONTAINE_GROUND_FLOOR_HEIGHT + storeyIndex * FONTAINE_STOREY_HEIGHT;
    const storeyTopY = storeyBaseY + FONTAINE_STOREY_HEIGHT;
    stoneBoxes.push([-halfWidth, storeyBaseY, -halfDepth, halfWidth, storeyTopY, halfDepth]);
    addCornice(storeyTopY);
    for (let bayIndex = 0; bayIndex < bayCount; bayIndex++) {
      const bayStartX = -halfWidth + bayIndex * bayWidth;
      const balconyStartX = bayStartX + FONTAINE_BALCONY_INSET;
      const balconyEndX = bayStartX + bayWidth - FONTAINE_BALCONY_INSET;
      const balconyOuterZ = frontZ + FONTAINE_BALCONY_DEPTH;
      const slabTopY = storeyBaseY + FONTAINE_BALCONY_HEIGHT + FONTAINE_BALCONY_SLAB_HEIGHT;
      stoneBoxes.push([
        balconyStartX,
        storeyBaseY + FONTAINE_BALCONY_HEIGHT,
        frontZ,
        balconyEndX,
        slabTopY,
        balconyOuterZ,
      ]);
      ironBoxes.push([
        balconyStartX,
        slabTopY,
        balconyOuterZ - FONTAINE_RAIL_THICKNESS,
        balconyEndX,
        slabTopY + FONTAINE_RAIL_HEIGHT,
        balconyOuterZ,
      ]);
      stoneBoxes.push([
        balconyStartX + FONTAINE_FLOWER_BOX_INSET,
        slabTopY,
        balconyOuterZ - FONTAINE_FLOWER_BOX_DEPTH,
        balconyEndX - FONTAINE_FLOWER_BOX_INSET,
        slabTopY + FONTAINE_FLOWER_BOX_HEIGHT,
        balconyOuterZ - FONTAINE_RAIL_THICKNESS,
      ]);
    }
  }

  // The mansard's lower slope breaks at its height, the shallow upper one rising from there to the roof's top
  const dormerY = roofBaseY + FONTAINE_MANSARD_LOWER_HEIGHT * FONTAINE_DORMER_SLOPE_POSITION;
  const dormerSurfaceZ = halfDepth * (1 - (1 - FONTAINE_MANSARD_LOWER_TAPER) * FONTAINE_DORMER_SLOPE_POSITION);
  for (let bayIndex = 0; bayIndex < bayCount; bayIndex++) {
    const dormerCenterX = -halfWidth + (bayIndex + 0.5) * bayWidth;
    const dormerHalfWidth = (FONTAINE_DORMER_WIDTH_RATIO * bayWidth) / 2;
    slateBoxes.push([
      dormerCenterX - dormerHalfWidth,
      dormerY,
      dormerSurfaceZ - FONTAINE_DORMER_INSET,
      dormerCenterX + dormerHalfWidth,
      dormerY + FONTAINE_DORMER_HEIGHT,
      dormerSurfaceZ + FONTAINE_DORMER_PROJECTION,
    ]);
  }
  const roofParts = [
    createFrustumGeometry(halfWidth, halfDepth, FONTAINE_MANSARD_LOWER_TAPER, roofBaseY, FONTAINE_MANSARD_LOWER_HEIGHT),
    createFrustumGeometry(
      halfWidth * FONTAINE_MANSARD_LOWER_TAPER,
      halfDepth * FONTAINE_MANSARD_LOWER_TAPER,
      FONTAINE_MANSARD_UPPER_TAPER,
      roofBaseY + FONTAINE_MANSARD_LOWER_HEIGHT,
      FONTAINE_MANSARD_UPPER_HEIGHT,
    ),
  ];

  // A lamp post stands at each front corner, its lantern on the post's head
  const lampPostGeometry = createLatheStackGeometry({
    isFaceted: false,
    radialSegments: FONTAINE_LAMP_RADIAL_SEGMENTS,
    sections: FONTAINE_LAMP_POST_SECTIONS,
  });
  const lampHeight = FONTAINE_LAMP_POST_SECTIONS.reduce(
    (height, { height: sectionHeight }) => height + sectionHeight,
    0,
  );
  const lampPostParts: BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const lampX = side * (halfWidth + FONTAINE_LAMP_OFFSET);
    const lampZ = frontZ + FONTAINE_LAMP_OFFSET;
    lampPostParts.push(lampPostGeometry.clone().translate(lampX, 0, lampZ));
    goldBoxes.push([
      lampX - FONTAINE_LANTERN_SIZE / 2,
      lampHeight,
      lampZ - FONTAINE_LANTERN_SIZE / 2,
      lampX + FONTAINE_LANTERN_SIZE / 2,
      lampHeight + FONTAINE_LANTERN_SIZE,
      lampZ + FONTAINE_LANTERN_SIZE / 2,
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
