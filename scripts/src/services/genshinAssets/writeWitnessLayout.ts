import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/readComponentPlacements";
import { readIndexedAssets } from "#src/services/genshinAssets/readIndexedAssets";
import { selectFinestLevels } from "#src/services/genshinAssets/selectFinestLevels";
import { toRightHanded } from "#src/services/genshinAssets/toRightHanded";
import { toRightHandedRotation } from "#src/services/genshinAssets/toRightHandedRotation";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

// A component's arrangement as the exports lay it out, for the witness render: each part at its finest level, in
// Three's axes, with every material it draws with and each material's values and textures, all named by the files the
// Export holds. It is written beside the exports and never enters the repository
// (apps/web/content/docs/proposals/genshin/scene-derivation.md)
export const writeWitnessLayout = async (component: DerivedAssetComponent): Promise<string> => {
  const directory = getComponentDirectory(component);
  const hasFile = (type: string, name: string, extension: string): boolean =>
    existsSync(join(directory.assets, type, `${name}.${extension}`));
  const [placements, materials] = await Promise.all([
    readComponentPlacements(component),
    readComponentMaterials(component),
  ]);
  const drawn = selectFinestLevels(placements, (mesh) => hasFile("Mesh", mesh, "obj"));
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
              return hasFile("Texture2D", textureName, "png") ? [[slot, { name: textureName, offset, scale }]] : [];
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
