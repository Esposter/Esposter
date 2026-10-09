import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";
import type { Vector } from "#src/models/shared/Vector";
import type { StatuePart, StatueStack } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { createNearestColourReader } from "#src/services/genshinAssets/fit/createNearestColourReader";
import { fitStatueComponent } from "#src/services/genshinAssets/fit/fitStatueComponent";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { sampleMeshSurface } from "#src/services/genshinAssets/fit/sampleMeshSurface";
import { sampleSurfaceTexture } from "#src/services/genshinAssets/fit/sampleSurfaceTexture";
import { splitMeshComponents } from "#src/services/genshinAssets/fit/splitMeshComponents";
import {
  MAIN_COLOUR_PROPERTY,
  ROTATION_DECIMALS,
  STATUE_COLOUR_NEAREST_COUNT,
  STATUE_DECIMALS,
  STATUE_FIGURE_MESH_REGEX,
  STATUE_FIT_SAMPLE_COUNT,
  STATUE_FIT_SEED,
  STATUE_MESH_REGEX,
  STATUE_SCORE_SAMPLE_COUNT,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toDiffusePath } from "#src/services/genshinAssets/shared/toDiffusePath";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { BYTE } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { join } from "node:path";
import sharp from "sharp";
import { Color, Matrix4, Quaternion, SRGBColorSpace, Vector3 } from "three";

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
  sections: sections.map(({ centre, colors, height, radii }) => ({
    centre: centre.map((value) => roundStatue(value)),
    colors,
    height: roundStatue(height),
    radii: radii.map((value) => roundStatue(value)),
  })),
});
// The Statue of The Seven as the statue kit's stacks in its frame, its root at the origin and unturned, so the Landmark's
// Place and turn set it down. Every statue mesh is taken into that frame by its placement and split into the pieces its
// Triangles join into, and each piece is fitted as one upright stack or as blades along their own lengths, whichever
// Lies nearer its surface (`fitStatueComponent`); each stack is named for the export mesh it came from, so the surface
// Pass draws each part of the statue in its own detail. Each stack's vertices carry the colour its piece's export
// Texture paints, tinted by the export material's colour as the game's G-buffer holds it, where the vertex stands: the
// Mean of the piece's fitted points nearest it (`createNearestColourReader`), so the stacks' colour follows the export's
// Surface over the piece rather than one colour a mesh, whose mean is read over faces no view shows. Returns the record
// `windrise/statue` with its report
export const fitWindriseStatue = async (): Promise<GameDataBuild> => {
  const { assets } = getComponentDirectory(DerivedAssetComponent.Windrise);
  const meshDirectory = join(assets, AssetType.Mesh);
  // The statue is spawned by its scene point, so its placements are read as the copies the witness lays out
  const [placements, materials] = await Promise.all([
    readComponentPlacements(DerivedAssetComponent.Windrise, { isCopied: true }),
    readComponentMaterials(DerivedAssetComponent.Windrise),
  ]);
  await nameMeshPlacements(placements);
  const statuePlacements = placements.filter(({ mesh }) => STATUE_MESH_REGEX.test(mesh));
  const pathIdNameMap = await readAssetNames(
    new Set([
      ...statuePlacements.flatMap((placement) => placement.materials),
      ...materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId)),
    ]),
  );
  const materialMap = new Map(materials.map((material) => [material.name, material]));
  const root = statuePlacements.find(({ mesh }) => !STATUE_FIGURE_MESH_REGEX.test(mesh));
  if (!root) throw new InvalidOperationError(Operation.Read, "Statue of The Seven", "has no stone mesh in its layout");
  const toRoot = toMatrix(root).invert();
  const parts: StatuePart[] = [];
  const reports: string[] = [];
  for (const placement of statuePlacements) {
    const transform = toRoot.clone().multiply(toMatrix(placement));
    // The statue draws one material a mesh, its texture tinted by its colour
    const material = materialMap.get(pathIdNameMap.get(placement.materials[0] ?? "") ?? "");
    const diffusePath = toDiffusePath(join(assets, AssetType.Texture2D), material, pathIdNameMap);
    if (!material || !diffusePath)
      throw new InvalidOperationError(Operation.Read, placement.mesh, "has no exported diffuse texture to colour it");
    const [tintRed = 1, tintGreen = 1, tintBlue = 1] = material.colors[MAIN_COLOUR_PROPERTY] ?? [];
    // oxlint-disable-next-line no-await-in-loop -- one mesh of thousands of vertices is read at a time
    const [{ faces, faceUvs, uvs, vertices: meshVertices }, texture] = await Promise.all([
      readObjMesh(join(meshDirectory, `${placement.mesh}.obj`)),
      sharp(diffusePath).raw().toBuffer({ resolveWithObject: true }),
    ]);
    const vertices = meshVertices.map((vertex): Vector =>
      new Vector3(...toRightHanded(vertex)).applyMatrix4(transform).toArray(),
    );
    const colour = new Color();
    const pieces = splitMeshComponents(vertices, faces).map((pieceFaceIndices) => {
      const pieceFaces = pieceFaceIndices.map((face): Vector => faces[face] ?? [0, 0, 0]);
      const random = createSeededRandom(STATUE_FIT_SEED);
      const pointSamples = sampleMeshSurface(vertices, pieceFaces, STATUE_FIT_SAMPLE_COUNT, random);
      const points = pointSamples.map(({ point }) => point);
      // Each point's texel, read at its own place on its face, in linear light under the material's tint
      const colours = pointSamples.map(({ face, weights }): Vector => {
        const corners = (faceUvs[pieceFaceIndices[face] ?? 0] ?? [0, 0, 0]).map((uv) => uvs[uv] ?? [0, 0]);
        const [u, v] = [0, 1].map((axis) =>
          corners.reduce((sum, corner, index) => sum + (corner[axis] ?? 0) * (weights[index] ?? 0), 0),
        );
        const [red, green, blue] = sampleSurfaceTexture(texture, [u ?? 0, v ?? 0]).colour;
        colour.setRGB(red / BYTE, green / BYTE, blue / BYTE, SRGBColorSpace);
        return [colour.r * tintRed, colour.g * tintGreen, colour.b * tintBlue];
      });
      const samples = sampleMeshSurface(vertices, pieceFaces, STATUE_SCORE_SAMPLE_COUNT, random);
      return fitStatueComponent(
        points,
        samples,
        random,
        createNearestColourReader(points, colours, STATUE_COLOUR_NEAREST_COUNT),
      );
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
