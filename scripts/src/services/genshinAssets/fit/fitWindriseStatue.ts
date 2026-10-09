import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";
import type { StatuePart, StatueStack } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitStatueComponent } from "#src/services/genshinAssets/fit/fitStatueComponent";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { sampleMeshSurface } from "#src/services/genshinAssets/fit/sampleMeshSurface";
import { splitMeshComponents } from "#src/services/genshinAssets/fit/splitMeshComponents";
import {
  ROTATION_DECIMALS,
  STATUE_DECIMALS,
  STATUE_FIGURE_MESH_REGEX,
  STATUE_FIT_SAMPLE_COUNT,
  STATUE_FIT_SEED,
  STATUE_MESH_REGEX,
  STATUE_SCORE_SAMPLE_COUNT,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { join } from "node:path";
import { Matrix4, Quaternion, Vector3 } from "three";

// A placement's transform in three's axes
const toMatrix = ({ position, rotation, scale }: Pick<AssetPlacement, "position" | "rotation" | "scale">): Matrix4 =>
  new Matrix4().compose(
    new Vector3(...toRightHanded(position)),
    new Quaternion(...toRightHandedRotation(rotation)),
    new Vector3(...scale),
  );
const roundStatue = (value: number): number => roundFitted(value, STATUE_DECIMALS);
// A stack as the data file keeps it: its places, heights and radii to the millimetre, its turn to the ten-thousandth
const roundStack = ({ position, rotation, sections }: StatueStack): StatueStack => ({
  position: position.map((value) => roundStatue(value)),
  rotation: rotation.map((value) => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS),
  sections: sections.map(({ centre, height, radii }) => ({
    centre: centre.map((value) => roundStatue(value)),
    height: roundStatue(height),
    radii: radii.map((value) => roundStatue(value)),
  })),
});
// The Statue of The Seven as the statue kit's stacks in its frame, its root at the origin and unturned, so the Landmark's
// Place and turn set it down. Every statue mesh is taken into that frame by its placement and split into the pieces its
// Triangles join into, and each piece is fitted as one upright stack or as blades along their own lengths, whichever
// Lies nearer its surface (`fitStatueComponent`); each stack is named for the export mesh it came from, so the surface
// Pass colours each part of the statue its own colour. Returns the record `windrise/statue` with its report
export const fitWindriseStatue = async (): Promise<GameDataBuild> => {
  const meshDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Mesh);
  // The statue is spawned by its scene point, so its placements are read as the copies the witness lays out
  const placements = await readComponentPlacements(DerivedAssetComponent.Windrise, { isCopied: true });
  await nameMeshPlacements(placements);
  const statuePlacements = placements.filter(({ mesh }) => STATUE_MESH_REGEX.test(mesh));
  const root = statuePlacements.find(({ mesh }) => !STATUE_FIGURE_MESH_REGEX.test(mesh));
  if (!root) throw new InvalidOperationError(Operation.Read, "Statue of The Seven", "has no stone mesh in its layout");
  const toRoot = toMatrix(root).invert();
  const parts: StatuePart[] = [];
  const reports: string[] = [];
  for (const placement of statuePlacements) {
    const transform = toRoot.clone().multiply(toMatrix(placement));
    // oxlint-disable-next-line no-await-in-loop -- one mesh of thousands of vertices is read at a time
    const { faces, vertices: meshVertices } = await readObjMesh(join(meshDirectory, `${placement.mesh}.obj`));
    const vertices = meshVertices.map((vertex): Vector =>
      new Vector3(...toRightHanded(vertex)).applyMatrix4(transform).toArray(),
    );
    const pieces = splitMeshComponents(vertices, faces).map((pieceFaces) => {
      const random = createSeededRandom(STATUE_FIT_SEED);
      const points = sampleMeshSurface(vertices, pieceFaces, STATUE_FIT_SAMPLE_COUNT, random).map(({ point }) => point);
      const samples = sampleMeshSurface(vertices, pieceFaces, STATUE_SCORE_SAMPLE_COUNT, random);
      return fitStatueComponent(points, samples, random);
    });
    for (const { stacks } of pieces)
      for (const stack of stacks) parts.push({ part: placement.mesh, ...roundStack(stack) });
    const meanScore = pieces.reduce((sum, { score }) => sum + score, 0) / pieces.length;
    reports.push(
      `${placement.mesh}: ${pieces.length} pieces as ${pieces.reduce((sum, { stacks }) => sum + stacks.length, 0)} stacks, mean score ${meanScore.toFixed(2)}`,
    );
  }
  return { notes: [...reports, `statue: ${parts.length} stacks`], objects: { "windrise/statue": { parts } } };
};
