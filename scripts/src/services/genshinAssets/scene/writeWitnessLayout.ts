import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { selectFinestLevels } from "#src/services/genshinAssets/shared/selectFinestLevels";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/shared/toRightHandedRotation";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

// A component's arrangement as the exports lay it out, for the witness render: each part at its finest level, in
// Three's axes, with every material it draws with and each material's values and textures, all named by the files the
// Export holds, under the component's roots or the ones given. It is written beside the exports and never enters the
// Repository
// (apps/web/content/docs/proposals/genshin/scene-derivation.md)
export const writeWitnessLayout = async (
  component: DerivedAssetComponent,
  roots?: readonly string[],
): Promise<string> => {
  const directory = getComponentDirectory(component);
  const checkHasFile = (type: string, name: string, extension: string): boolean =>
    existsSync(join(directory.assets, type, `${name}.${extension}`));
  const [placements, materials] = await Promise.all([
    readComponentPlacements(component, { isCopied: true, roots }),
    readComponentMaterials(component),
  ]);
  // A mesh a placement names by path ID (a skinned mesh in another file) is named through the asset index first
  const meshPathIds = new Set(placements.map(({ mesh }) => mesh).filter((mesh) => /^-?\d+$/u.test(mesh)));
  const meshAssets = await readIndexedAssets(({ pathId, type }) => type === "Mesh" && meshPathIds.has(pathId));
  const pathIdMeshMap = new Map(meshAssets.map(({ name, pathId }) => [pathId, name]));
  for (const placement of placements) placement.mesh = pathIdMeshMap.get(placement.mesh) ?? placement.mesh;
  const drawn = selectFinestLevels(placements, (mesh) => checkHasFile("Mesh", mesh, "obj"));
  const referencedIds = new Set([
    ...drawn.flatMap(({ materials: drawnMaterials }) => drawnMaterials),
    ...materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId)),
  ]);
  const indexed = await readIndexedAssets(({ pathId }) => referencedIds.has(pathId));
  const pathIdNameMap = new Map(indexed.map(({ name, pathId }) => [pathId, name]));
  const layout: SceneLayout = {
    materials: Object.fromEntries(
      materials.map(({ colors, floats, name, textures }) => [
        name,
        {
          colors,
          floats,
          name,
          textures: Object.fromEntries(
            Object.entries(textures).flatMap(([slot, { offset, pathId, scale }]) => {
              const textureName = pathIdNameMap.get(pathId) ?? "";
              return checkHasFile("Texture2D", textureName, "png")
                ? [[slot, { name: textureName, offset, scale }]]
                : [];
            }),
          ),
        },
      ]),
    ),
    placements: drawn.map(({ materials: drawnMaterials, mesh, position, rotation, scale }) => ({
      materials: drawnMaterials.map((pathId) => pathIdNameMap.get(pathId) ?? pathId),
      mesh,
      position: toRightHanded(position),
      rotation: toRightHandedRotation(rotation),
      scale,
    })),
  };
  const path = join(directory.root, "witness.json");
  await writeFile(path, JSON.stringify(layout));
  return path;
};
