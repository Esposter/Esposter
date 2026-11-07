import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { Vector } from "#src/models/shared/Vector";
import type { StatuePart } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { createFaceColourReader } from "#src/services/genshinAssets/fit/createFaceColourReader";
import { findStatueRoot } from "#src/services/genshinAssets/fit/findStatueRoot";
import { fitMeshPieces } from "#src/services/genshinAssets/fit/fitMeshPieces";
import { readTexture } from "#src/services/genshinAssets/fit/readTexture";
import { roundStack } from "#src/services/genshinAssets/fit/roundStack";
import { readMaterialTint } from "#src/services/genshinAssets/fit/tintMaterialTexture";
import { toMatrix } from "#src/services/genshinAssets/fit/toMatrix";
import { STATUE_MESH_REGEX } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { nameMeshPlacements } from "#src/services/genshinAssets/shared/nameMeshPlacements";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toDiffusePath } from "#src/services/genshinAssets/shared/toDiffusePath";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import { Vector3 } from "three";

// The Statue of The Seven of a component's exports as the statue kit's stacks in its frame, its root at the origin and
// Unturned, so the Landmark's Place and turn set it down. Every statue mesh is taken into that frame by its placement and
// Split into the pieces its triangles join into, and each piece is fitted as one upright stack or as blades along their
// Own lengths, whichever lies nearer its surface (`fitMeshPieces`); each stack is named for the export mesh it came
// From, so the surface pass draws each part of the statue in its own detail. Each stack's vertices carry the colour its
// Piece's export texture paints, tinted by the export material's colour as the game's G-buffer holds it, where the vertex
// Stands: the mean of the piece's fitted points nearest it (`createFaceColourReader`), so the stacks' colour follows
// The export's surface over the piece rather than one colour a mesh, whose mean is read over faces no view shows.
// Returns the record `<component>/statue` with its report. A component whose layout places no Goddess stone mesh has no
// Statue, so it returns its note and no record
export const fitRegionStatue = async (component: DerivedAssetComponent): Promise<GameDataBuild> => {
  const { assets } = getComponentDirectory(component);
  const meshDirectory = join(assets, AssetType.Mesh);
  // The statue is spawned by its scene point, so its placements are read as the copies the witness lays out
  const [placements, materials] = await Promise.all([
    readComponentPlacements(component, { isCopied: true }),
    readComponentMaterials(component),
  ]);
  await nameMeshPlacements(placements);
  const statuePlacements = placements.filter(({ mesh }) => STATUE_MESH_REGEX.test(mesh));
  const root = findStatueRoot(statuePlacements);
  if (!root)
    return {
      notes: [`${component}: no Goddess statue stone mesh in its layout, so no statue record is published`],
      objects: {},
    };
  const pathIdNameMap = await readAssetNames(
    new Set([
      ...statuePlacements.flatMap((placement) => placement.materials),
      ...materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId)),
    ]),
  );
  const materialMap = new Map(materials.map((material) => [material.name, material]));
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
    const [tintRed, tintGreen, tintBlue] = readMaterialTint(material);
    // oxlint-disable-next-line no-await-in-loop -- one mesh of thousands of vertices is read at a time
    const [{ faces, faceUvs, uvs, vertices: meshVertices }, texture] = await Promise.all([
      readObjMesh(join(meshDirectory, `${placement.mesh}.obj`)),
      readTexture(diffusePath),
    ]);
    const vertices = meshVertices.map((vertex): Vector =>
      new Vector3(...toRightHanded(vertex)).applyMatrix4(transform).toArray(),
    );
    const pieces = fitMeshPieces(
      vertices,
      faces,
      createFaceColourReader({ faceUvs, uvs }, texture, [tintRed, tintGreen, tintBlue]),
    );
    for (const { stacks } of pieces)
      for (const stack of stacks) parts.push({ part: placement.mesh, ...roundStack(stack) });
    const meanScore = pieces.length > 0 ? pieces.reduce((sum, { score }) => sum + score, 0) / pieces.length : 0;
    reports.push(
      `${placement.mesh}: ${pieces.length} pieces as ${pieces.reduce((sum, { stacks }) => sum + stacks.length, 0)} stacks, mean score ${meanScore.toFixed(2)}`,
    );
  }
  return { notes: [...reports, `statue: ${parts.length} stacks`], objects: { [`${component}/statue`]: { parts } } };
};
