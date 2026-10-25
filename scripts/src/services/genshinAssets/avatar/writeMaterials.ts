import type { DrawableMaterial } from "#src/models/genshinAssets/avatar/DrawableMaterial";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";
import type { AvatarMaterial } from "genshin-world/sceneExport";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { assertUniqueNames } from "#src/services/genshinAssets/avatar/assertUniqueNames";
import { readName } from "#src/services/genshinAssets/avatar/readName";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readObjectNames } from "#src/services/genshinAssets/shared/readObjectNames";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The materials the meshes draw with, keyed by their names, each with its values and the texture files its slots point at
export const writeMaterials = async (
  component: DerivedAssetComponent,
  cabMap: ReadonlyMap<string, CabEntry>,
  names: ReadonlyMap<string, string>,
  drawable: ReadonlyMap<string, DrawableMaterial>,
  references: readonly ResolvedObject[],
): Promise<Record<string, AvatarMaterial>> => {
  const textureDirectory = join(getComponentDirectory(component).assets, AssetType.Texture2D);
  const used = [
    ...new Map(references.map((reference) => [toObjectKey(reference.file, reference.pathId), reference])).values(),
  ];
  const materialOf = (reference: ResolvedObject): DrawableMaterial => {
    const material = drawable.get(toObjectKey(reference.file, reference.pathId));
    if (!material) throw new InvalidOperationError(Operation.Read, reference.pathId, "is a drawn material never read");
    return material;
  };
  const textures = used.flatMap((reference) => Object.values(materialOf(reference).textures));
  const textureNames = await readObjectNames(textures, cabMap);
  assertUniqueNames(textures, textureNames, "texture");
  // The manifest keys its materials by name, so two drawn materials under one name are an error, never one overwriting the other
  assertUniqueNames(used, names, "material");
  return Object.fromEntries(
    used.map((reference): [string, AvatarMaterial] => {
      const { colors, floats, keywords, textures: slots } = materialOf(reference);
      return [
        readName(names, reference),
        {
          colors,
          floats,
          keywords,
          textures: Object.fromEntries(
            Object.entries(slots).flatMap(([slot, texture]) => {
              const file = `${readName(textureNames, texture)}.png`;
              return existsSync(join(textureDirectory, file)) ? [[slot, file]] : [];
            }),
          ),
        },
      ];
    }),
  );
};
