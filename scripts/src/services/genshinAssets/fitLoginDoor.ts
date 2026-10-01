import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { fitSilhouette } from "#src/services/genshinAssets/fitSilhouette";
import { readObjMesh } from "#src/services/genshinAssets/readObjMesh";
import { roundFitted } from "#src/services/genshinAssets/roundFitted";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The door's object and the mesh it draws share this name, its frame drawn in its first submesh and its panel in its
// Second
const DOOR_MESH = "LoginScene_Door01_Vo";
const FRAME_GROUP = `${DOOR_MESH}_0`;
const PANEL_GROUP = `${DOOR_MESH}_1`;
// A part's face is traced on a two-centimetre grid and kept within a cell of it, so its diagonals run straight
const DOOR_CELL_SIZE = 0.02;
const DOOR_OUTLINE_TOLERANCE = 0.02;
// The door where the scene stands it, its size there, and its frame and panel each as its face seen from the front in
// Three's axes, every loop round it (an outer ring counterclockwise, a hole clockwise) from the foot of its middle,
// With the depths its front and back stand at: the frame's head and shoulders as the game's own, where a round head of
// Shares read off the capture stood in for them before
export const fitLoginDoor = async (
  placements: readonly AssetPlacement[],
  meshDirectory: string,
): Promise<{
  frame: { depth: [number, number]; loops: [number, number][][] };
  panel: { depth: [number, number]; loops: [number, number][][] };
  position: [number, number, number];
  size: [number, number, number];
}> => {
  const placement = placements.find(({ name }) => name === DOOR_MESH);
  if (!placement) throw new InvalidOperationError(Operation.Read, DOOR_MESH, "not placed in the login scene");
  const { faceGroups, faces, vertices } = await readObjMesh(join(meshDirectory, `${DOOR_MESH}.obj`));
  const [scale] = placement.scale;
  const scaled = vertices.map((vertex) => {
    const [x, y, z] = toRightHanded(vertex);
    return [x * scale, y * scale, z * scale] satisfies [number, number, number];
  });
  const extent = (axis: 0 | 1 | 2): number =>
    Math.max(...scaled.map((vertex) => vertex[axis])) - Math.min(...scaled.map((vertex) => vertex[axis]));
  const foot = Math.min(...scaled.map(([, y]) => y));
  const toFront = (index: number): [number, number] => {
    const [x = 0, y = 0] = scaled[index] ?? [];
    return [x, y - foot];
  };
  const fitPart = (group: string): { depth: [number, number]; loops: [number, number][][] } => {
    const partFaces = faces.filter((_, index) => faceGroups[index] === group);
    const depths = partFaces.flatMap((face) => face.map((index) => scaled[index]?.[2] ?? 0));
    const triangles = partFaces.map(([a, b, c]) => [toFront(a), toFront(b), toFront(c)] as const);
    return {
      depth: [roundFitted(Math.min(...depths)), roundFitted(Math.max(...depths))],
      loops: fitSilhouette(triangles, { cellSize: DOOR_CELL_SIZE, tolerance: DOOR_OUTLINE_TOLERANCE }).map((loop) =>
        loop.map(([x, y]): [number, number] => [roundFitted(x), roundFitted(y)]),
      ),
    };
  };
  const [x = 0, y = 0, z = 0] = toRightHanded(placement.position).map((value) => roundFitted(value));
  return {
    frame: fitPart(FRAME_GROUP),
    panel: fitPart(PANEL_GROUP),
    position: [x, y, z],
    size: [roundFitted(extent(0)), roundFitted(extent(1)), roundFitted(extent(2))],
  };
};
