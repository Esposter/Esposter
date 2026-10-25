import type { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import type { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { GROUP_BY_TYPE } from "#src/services/genshinAssets/blocks/constants";
import { GENSHIN_ANIMESTUDIO_OPTIONS, INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { join } from "node:path";

// The resolved objects of the given types, named through the asset index by their block and path ID, each exported
// From its block by its exact name, converted or as the export type given. The index holds no file, so a block and path ID it names more than once, or that
// Several files of the block resolve to, is as unresolved as one it does not name
export const exportResolvedAssets = async (
  resolvedObjects: readonly ResolvedObject[],
  types: readonly AssetType[],
  assetsDirectory: string,
  exportType?: AnimeStudioExportType,
): Promise<{ assets: (IndexedAsset & { file: string })[]; unresolved: string[] }> => {
  const keyObjectsMap = Map.groupBy(resolvedObjects, ({ block, pathId }) => toObjectKey(block, pathId));
  const keyIndexedMap = Map.groupBy(
    await readIndexedAssets(
      ({ block, pathId, type }) =>
        types.some((assetType) => assetType === type) && keyObjectsMap.has(toObjectKey(block, pathId)),
      GENSHIN_ANIMESTUDIO_OPTIONS,
    ),
    ({ block, pathId }) => toObjectKey(block, pathId),
  );
  const assets: (IndexedAsset & { file: string })[] = [];
  const unresolved: string[] = [];
  for (const [key, objects] of keyObjectsMap) {
    const files = [...new Set(objects.map(({ file }) => file))];
    const indexed = keyIndexedMap.get(key) ?? [];
    const [file] = files;
    const [asset] = indexed;
    if (file && asset && files.length === 1 && indexed.length === 1) assets.push({ ...asset, file });
    else {
      const { block, pathId } = objects[0] ?? { block: "", pathId: "" };
      const reason =
        indexed.length === 0
          ? `not in the asset index as ${types.join(" or ")}`
          : files.length > 1
            ? "resolved from several files of its block, which the asset index does not tell apart"
            : `named ${indexed.length} times by the asset index`;
      unresolved.push(`path ID ${pathId} of ${files.join(" and ")} in ${block}: ${reason}`);
    }
  }
  for (const [block, blockAssets] of Map.groupBy(assets, (asset) => asset.block)) {
    const names = [...new Set(blockAssets.map(({ name }) => RegExp.escape(name)))];
    runAnimeStudio(
      [
        join(INSTALLED_BLOCKS_DIRECTORY, block),
        assetsDirectory,
        "--names",
        `^(${names.join("|")})$`,
        "--types",
        ...types,
        ...GROUP_BY_TYPE,
        ...(exportType ? ["--export_type", exportType] : []),
      ],
      GENSHIN_ANIMESTUDIO_OPTIONS,
    );
  }
  return { assets, unresolved };
};
