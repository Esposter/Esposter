import type { LoginScrollRow } from "#src/models/login/LoginScrollRow";
import type { LoginWalkwayPiece } from "#src/models/login/LoginWalkwayPiece";
import type { Object3D } from "three";

import { LOGIN_WALKWAY_RISE_DEPTH } from "#src/services/login/walkway/constants";
import { getLoginWalkwaySink } from "#src/services/login/walkway/getLoginWalkwaySink";
import { Box3, MathUtils, Vector3 } from "three";

interface WitnessPiece {
  laidY: number;
  middle: [number, number];
  seed: number;
}
const box = new Box3();
const center = new Vector3();
const groupPosition = new Vector3();
// The game's own walkway pieces, drawn by the witness in place of ours, assembling as ours do: each stands under its
// Place by how far ahead of the camera its middle is and the seed of our piece standing where it does in its copy, and
// Not at all before its rise or past the door once the door is due, so a frame of the walkway's far end prices our
// Pieces against the game's rising alike rather than against a walkway built out to the horizon. Each piece's middle,
// Laid height and seed are read the first time it is sunk, before it has moved, its copy found along the walkway's row
export const sinkLoginWitnessWalkway = (
  walkwayRow: LoginScrollRow,
  group: Object3D,
  pieces: readonly LoginWalkwayPiece[],
  { cameraZ, doorAheadOfCamera }: { cameraZ: number; doorAheadOfCamera?: number },
): void => {
  group.getWorldPosition(groupPosition);
  for (const part of group.children) {
    let piece = part.userData.walkwayPiece as undefined | WitnessPiece;
    if (!piece) {
      part.updateWorldMatrix(true, true);
      box.setFromObject(part).getCenter(center).sub(groupPosition);
      const middle: [number, number] = [center.x, center.z];
      // Our piece standing nearest its middle in its copy of the walkway
      const nearest = pieces.reduce<{ distance: number; seed: number }>(
        (best, { depth, geometry, seed }) => {
          geometry.computeBoundingBox();
          const pieceX = geometry.boundingBox?.getCenter(new Vector3()).x ?? 0;
          const offset = MathUtils.euclideanModulo(middle[1] - depth + walkwayRow.length / 2, walkwayRow.length);
          const distance = Math.hypot(middle[0] - pieceX, offset - walkwayRow.length / 2);
          return distance < best.distance ? { distance, seed } : best;
        },
        { distance: Number.POSITIVE_INFINITY, seed: 0 },
      );
      piece = { laidY: part.position.y, middle, seed: nearest.seed };
      part.userData.walkwayPiece = piece;
    }
    const ahead = groupPosition.z + piece.middle[1] - cameraZ;
    const sink = getLoginWalkwaySink(ahead, piece.seed);
    part.position.y = piece.laidY - sink;
    part.visible = sink < LOGIN_WALKWAY_RISE_DEPTH && (doorAheadOfCamera === undefined || ahead < doorAheadOfCamera);
  }
};
