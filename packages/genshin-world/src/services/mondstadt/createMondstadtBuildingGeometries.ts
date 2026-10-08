import type { MondstadtBuildingGeometries } from "#src/models/mondstadt/MondstadtBuildingGeometries";
import type { MondstadtBuildingOptions } from "#src/models/mondstadt/MondstadtBuildingOptions";
import type { BufferGeometry } from "three";

import {
  MONDSTADT_CHIMNEY_RISE,
  MONDSTADT_CHIMNEY_SIZE,
  MONDSTADT_DORMER_DEPTH,
  MONDSTADT_DORMER_HEIGHT,
  MONDSTADT_DORMER_SINK,
  MONDSTADT_DORMER_WIDTH,
  MONDSTADT_EAVE_OVERHANG,
  MONDSTADT_TIMBER_PROUD,
  MONDSTADT_TIMBER_THICKNESS,
} from "#src/services/mondstadt/constants";
import { mergeGeometryParts } from "genshin-engine";
import { BoxGeometry, ExtrudeGeometry, Shape, Vector2 } from "three";

// A box between two corners, non-indexed so that every part of one material merges into one geometry
const createBox = (
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
): BufferGeometry => {
  const box = new BoxGeometry(maxX - minX, maxY - minY, maxZ - minZ).translate(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2,
  );
  const part = box.toNonIndexed();
  box.dispose();
  return part;
};

// The span of a timber member on one side of a wall: its inner face sits in the plaster and its outer face stands proud
const getTimberSpan = (sign: number, halfExtent: number): [number, number] =>
  sign < 0
    ? [-halfExtent - MONDSTADT_TIMBER_PROUD, -halfExtent + MONDSTADT_TIMBER_THICKNESS]
    : [halfExtent - MONDSTADT_TIMBER_THICKNESS, halfExtent + MONDSTADT_TIMBER_PROUD];

// A Mondstadt house as four materials: a stone ground floor, storeys of plaster in a timber frame that overhang the one
// Below, and a steep gable with dormers and a chimney. Each storey's jetty is measured from the storey beneath it
export const createMondstadtBuildingGeometries = ({
  depth,
  dormerCount,
  groundHeight,
  jettyDepth,
  roofRise,
  storeyCount,
  storeyHeight,
  width,
}: MondstadtBuildingOptions): MondstadtBuildingGeometries => {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const stonePieces = [createBox(-halfWidth, 0, -halfDepth, halfWidth, groundHeight, halfDepth)];
  const plasterPieces: BufferGeometry[] = [];
  const timberPieces: BufferGeometry[] = [];
  let storeyBottom = groundHeight;
  let storeyHalfDepth = halfDepth;
  for (let storey = 0; storey < storeyCount; storey++) {
    const storeyTop = storeyBottom + storeyHeight;
    storeyHalfDepth += jettyDepth;
    plasterPieces.push(createBox(-halfWidth, storeyBottom, -storeyHalfDepth, halfWidth, storeyTop, storeyHalfDepth));
    // A corner post at each corner of the storey, and a beam along the top of each wall
    for (const signX of [-1, 1])
      for (const signZ of [-1, 1]) {
        const [minX, maxX] = getTimberSpan(signX, halfWidth);
        const [minZ, maxZ] = getTimberSpan(signZ, storeyHalfDepth);
        timberPieces.push(createBox(minX, storeyBottom, minZ, maxX, storeyTop, maxZ));
      }
    for (const signZ of [-1, 1]) {
      const [minZ, maxZ] = getTimberSpan(signZ, storeyHalfDepth);
      timberPieces.push(
        createBox(-halfWidth, storeyTop - MONDSTADT_TIMBER_THICKNESS, minZ, halfWidth, storeyTop, maxZ),
      );
    }
    storeyBottom = storeyTop;
  }

  // The roof's ridge runs along the width, so its gable ends face the short sides of the footprint
  const roofBase = storeyBottom;
  const eaveHalfDepth = storeyHalfDepth + MONDSTADT_EAVE_OVERHANG;
  const roofWidth = width + MONDSTADT_EAVE_OVERHANG * 2;
  const roofShape = new Shape([
    new Vector2(-eaveHalfDepth, roofBase),
    new Vector2(eaveHalfDepth, roofBase),
    new Vector2(0, roofBase + roofRise),
  ]);
  const roofPrism = new ExtrudeGeometry(roofShape, { bevelEnabled: false, depth: roofWidth });
  // Turning the prism about the vertical maps its extrusion onto the width, and its gable onto the depth
  roofPrism.rotateY(Math.PI / 2).translate(-roofWidth / 2, 0, 0);
  const roofPieces: BufferGeometry[] = [roofPrism];
  // A dormer stands at the middle of each slope, where the roof is at half its rise
  const slopeY = roofBase + roofRise / 2;
  for (const signZ of [-1, 1]) {
    const dormerZ = (signZ * eaveHalfDepth) / 2;
    for (let dormer = 0; dormer < dormerCount; dormer++) {
      const dormerX = -halfWidth + (width * (dormer + 1)) / (dormerCount + 1);
      roofPieces.push(
        createBox(
          dormerX - MONDSTADT_DORMER_WIDTH / 2,
          slopeY - MONDSTADT_DORMER_SINK,
          dormerZ - MONDSTADT_DORMER_DEPTH / 2,
          dormerX + MONDSTADT_DORMER_WIDTH / 2,
          slopeY + MONDSTADT_DORMER_HEIGHT,
          dormerZ + MONDSTADT_DORMER_DEPTH / 2,
        ),
      );
    }
  }
  // The chimney stands on the building's own stone, a quarter of the way along, and rises past the ridge
  stonePieces.push(
    createBox(
      width / 4 - MONDSTADT_CHIMNEY_SIZE / 2,
      roofBase,
      -MONDSTADT_CHIMNEY_SIZE / 2,
      width / 4 + MONDSTADT_CHIMNEY_SIZE / 2,
      roofBase + roofRise + MONDSTADT_CHIMNEY_RISE,
      MONDSTADT_CHIMNEY_SIZE / 2,
    ),
  );

  return {
    plaster: mergeGeometryParts(plasterPieces),
    roof: mergeGeometryParts(roofPieces),
    stone: mergeGeometryParts(stonePieces),
    timber: mergeGeometryParts(timberPieces),
  };
};
