import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { ExportedMesh } from "#src/models/genshinAssets/shared/ExportedMesh";

import { fitRigidPieces } from "#src/services/genshinAssets/fit/fitRigidPieces";
import { LOGIN_DOOR_MESH } from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Matrix4 } from "three";

// The clip its pieces rise into place by, as `genshin:assets clips` decoded it
const DOOR_LIFT_CLIP = "Ani_LogginScene_Door01_Liftting";
// The login's door as its mesh and its lift clip hold it: its mesh, where the scene places it, its vertices scaled into
// Metres in Three's axes, the height of its foot among them, the piece each vertex rides on, and each piece's pose at
// Every one of the lift's samples, spread evenly over its seconds, carried into the door's own space (scaled, z
// Mirrored and its foot at zero), which its layers and the lift the scene plays are written in
export const readLoginDoorPieces = async (
  placements: readonly AssetPlacement[],
  clips: readonly DecodedClip[],
  meshDirectory: string,
): Promise<{
  duration: number;
  foot: number;
  mesh: Awaited<ReturnType<typeof readObjMesh>>;
  piecePoses: Matrix4[][];
  placement: AssetPlacement;
  scaled: [number, number, number][];
  vertexPieces: number[];
}> => {
  const placement = placements.find(({ name }) => name === LOGIN_DOOR_MESH);
  if (!placement) throw new InvalidOperationError(Operation.Read, LOGIN_DOOR_MESH, "not placed in the login scene");
  const lift = clips.find(({ name }) => name === DOOR_LIFT_CLIP);
  if (!lift) throw new InvalidOperationError(Operation.Read, DOOR_LIFT_CLIP, "not decoded: run `genshin:assets clips`");
  const mesh = await readObjMesh(join(meshDirectory, `${LOGIN_DOOR_MESH}.obj`));
  const { poses, vertexPieces } = fitRigidPieces(
    parseMachineJson<ExportedMesh>(await readFile(join(meshDirectory, `${LOGIN_DOOR_MESH}.json`), "utf8")),
    lift,
  );
  const [scale] = placement.scale;
  const scaled = mesh.vertices.map((vertex) => {
    const [x, y, z] = toRightHanded(vertex);
    return [x * scale, y * scale, z * scale] satisfies [number, number, number];
  });
  const foot = Math.min(...scaled.map(([, y]) => y));
  const toLayers = new Matrix4().makeTranslation(0, -foot, 0).multiply(new Matrix4().makeScale(scale, scale, -scale));
  const fromLayers = toLayers.clone().invert();
  return {
    duration: lift.duration,
    foot,
    mesh,
    piecePoses: poses.map((samplePoses) =>
      samplePoses.map((pose) => toLayers.clone().multiply(pose).multiply(fromLayers)),
    ),
    placement,
    scaled,
    vertexPieces,
  };
};
