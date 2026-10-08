import type { InazumaBuildingGeometry } from "#src/models/inazuma/InazumaBuildingGeometry";
import type { InazumaBuildingOptions } from "#src/models/inazuma/InazumaBuildingOptions";

import { createInazumaRoofGeometry } from "#src/services/inazuma/createInazumaRoofGeometry";
import { createBoxesGeometry, mergeGeometryParts } from "genshin-engine";
import type { BufferGeometry } from "three";

const POST_SIZE = 0.3;
const BEAM_SIZE = 0.2;
const PANEL_THICKNESS = 0.08;
// A post or a beam of the frame, centred on (x, z) and standing between two heights
const pushPost = (boxes: number[][], x: number, z: number, minY: number, maxY: number): void => {
  boxes.push([x - POST_SIZE / 2, minY, z - POST_SIZE / 2, x + POST_SIZE / 2, maxY, z + POST_SIZE / 2]);
};
// Inazuma's post-and-beam building: a raised timber floor on posts, then each storey's corner posts and top beams with
// Plastered panels between them, and its roof on the walls. Every storey stands on the roof below and is inset by the
// Setback, so a tower's storeys step up. Each material's parts are merged into one geometry, standing on the origin
export const createInazumaBuildingGeometry = ({
  depth,
  eaveOverhang,
  floorHeight,
  roof,
  roofHeight,
  storeyCount,
  storeyHeight,
  storeySetback,
  width,
}: InazumaBuildingOptions): InazumaBuildingGeometry => {
  const timberBoxes: number[][] = [];
  const plasterBoxes: number[][] = [];
  const roofGeometries: BufferGeometry[] = [];
  let storeyBase = floorHeight;
  for (let storey = 0; storey < storeyCount; storey++) {
    const halfWidth = width / 2 - storey * storeySetback;
    const halfDepth = depth / 2 - storey * storeySetback;
    const storeyTop = storeyBase + storeyHeight;
    // The first storey's posts run down through its floor to the ground
    const postBottom = storey === 0 ? 0 : storeyBase;
    timberBoxes.push([-halfWidth, storeyBase - BEAM_SIZE, -halfDepth, halfWidth, storeyBase, halfDepth]);
    for (const x of [-halfWidth + POST_SIZE / 2, halfWidth - POST_SIZE / 2])
      for (const z of [-halfDepth + POST_SIZE / 2, halfDepth - POST_SIZE / 2])
        pushPost(timberBoxes, x, z, postBottom, storeyTop);
    for (const sign of [-1, 1]) {
      const beamZ = sign * (halfDepth - POST_SIZE / 2);
      timberBoxes.push([
        -halfWidth,
        storeyTop - BEAM_SIZE,
        beamZ - BEAM_SIZE / 2,
        halfWidth,
        storeyTop,
        beamZ + BEAM_SIZE / 2,
      ]);
      plasterBoxes.push([
        -halfWidth + POST_SIZE,
        storeyBase,
        beamZ - PANEL_THICKNESS / 2,
        halfWidth - POST_SIZE,
        storeyTop - BEAM_SIZE,
        beamZ + PANEL_THICKNESS / 2,
      ]);
      const beamX = sign * (halfWidth - POST_SIZE / 2);
      timberBoxes.push([
        beamX - BEAM_SIZE / 2,
        storeyTop - BEAM_SIZE,
        -halfDepth,
        beamX + BEAM_SIZE / 2,
        storeyTop,
        halfDepth,
      ]);
      plasterBoxes.push([
        beamX - PANEL_THICKNESS / 2,
        storeyBase,
        -halfDepth + POST_SIZE,
        beamX + PANEL_THICKNESS / 2,
        storeyTop - BEAM_SIZE,
        halfDepth - POST_SIZE,
      ]);
    }
    roofGeometries.push(
      createInazumaRoofGeometry(
        roof,
        2 * (halfWidth + eaveOverhang),
        2 * (halfDepth + eaveOverhang),
        roofHeight,
      ).translate(0, storeyTop, 0),
    );
    storeyBase = storeyTop + roofHeight;
  }
  return {
    plasterGeometry: createBoxesGeometry(plasterBoxes),
    roofGeometry: mergeGeometryParts(roofGeometries),
    timberGeometry: createBoxesGeometry(timberBoxes),
  };
};
