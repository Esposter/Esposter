import type { BuildingGeometries } from "#src/models/kits/mondstadt/BuildingGeometries";
import type { BuildingOptions } from "#src/models/kits/mondstadt/BuildingOptions";
import type { BufferGeometry } from "three";

import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import {
  CHIMNEY_RISE,
  CHIMNEY_SIZE,
  DORMER_DEPTH,
  DORMER_HEIGHT,
  DORMER_SINK,
  DORMER_WIDTH,
  EAVE_OVERHANG,
  TIMBER_PROUD,
  TIMBER_THICKNESS,
} from "#src/kits/mondstadt/constants";
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
    ? [-halfExtent - TIMBER_PROUD, -halfExtent + TIMBER_THICKNESS]
    : [halfExtent - TIMBER_THICKNESS, halfExtent + TIMBER_PROUD];

// A Mondstadt house as four materials: a stone ground floor, storeys of plaster in a timber frame that overhang the one
// Below, and a steep gable with dormers and a chimney. Each storey's jetty is measured from the storey beneath it
export const createBuildingGeometries = ({
  dormerCount,
  depth,
  groundHeight,
  jettyDepth,
  roofRise,
  storeyCount,
  storeyHeight,
  width,
}: BuildingOptions): BuildingGeometries => {
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
    plasterPieces.push(
      createBox(-halfWidth, storeyBottom, -storeyHalfDepth, halfWidth, storeyTop, storeyHalfDepth),
    );
    // A corner post at each corner of the storey, and a beam along the top of each wall
    for (const signX of [-1, 1])
      for (const signZ of [-1, 1]) {
        const [minX, maxX] = getTimberSpan(signX, halfWidth);
        const [minZ, maxZ] = getTimberSpan(signZ, storeyHalfDepth);
        timberPieces.push(createBox(minX, storeyBottom, minZ, maxX, storeyTop, maxZ));
      }
    for (const signZ of [-1, 1]) {
      const [minZ, maxZ] = getTimberSpan(signZ, storeyHalfDepth);
      timberPieces.push(createBox(-halfWidth, storeyTop - TIMBER_THICKNESS, minZ, halfWidth, storeyTop, maxZ));
    }
    storeyBottom = storeyTop;
  }

  // The roof's ridge runs along the width, so its gable ends face the short sides of the footprint
  const roofBase = storeyBottom;
  const eaveHalfDepth = storeyHalfDepth + EAVE_OVERHANG;
  const roofWidth = width + EAVE_OVERHANG * 2;
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
          dormerX - DORMER_WIDTH / 2,
          slopeY - DORMER_SINK,
          dormerZ - DORMER_DEPTH / 2,
          dormerX + DORMER_WIDTH / 2,
          slopeY + DORMER_HEIGHT,
          dormerZ + DORMER_DEPTH / 2,
        ),
      );
    }
  }
  // The chimney stands on the building's own stone, a quarter of the way along, and rises past the ridge
  stonePieces.push(
    createBox(
      width / 4 - CHIMNEY_SIZE / 2,
      roofBase,
      -CHIMNEY_SIZE / 2,
      width / 4 + CHIMNEY_SIZE / 2,
      roofBase + roofRise + CHIMNEY_RISE,
      CHIMNEY_SIZE / 2,
    ),
  );

  return {
    plaster: mergeGeometryParts(plasterPieces),
    roof: mergeGeometryParts(roofPieces),
    stone: mergeGeometryParts(stonePieces),
    timber: mergeGeometryParts(timberPieces),
  };
};
