import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { EXPORTED_ASSET_TYPES, GAME_BLOCKS_DIRECTORY, LAYOUT_ASSET_TYPES } from "#src/services/genshinAssets/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/readAssetBlocks";
import { runAnimeStudio } from "#src/services/genshinAssets/runAnimeStudio";
import { mkdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";

// One component's assets out of the blocks holding them: its meshes as OBJ, its textures as PNG and its materials as
// JSON, grouped by type, and every block's hierarchy dumped as JSON, which `fit` composes placements from
export const extractComponent = async (component: DerivedAssetComponent): Promise<void> => {
  const { namePattern } = DerivedAssetComponentMap[component];
  const directory = getComponentDirectory(component);
  const blocks = await readAssetBlocks(namePattern);
  await Promise.all([directory.assets, directory.layout].map((path) => rm(path, { force: true, recursive: true })));
  await mkdir(directory.layout, { recursive: true });
  for (const block of blocks) {
    const blockPath = join(GAME_BLOCKS_DIRECTORY, block);
    const common = ["--group_assets", "ByType"];
    runAnimeStudio([
      blockPath,
      directory.assets,
      "--names",
      namePattern,
      "--types",
      ...EXPORTED_ASSET_TYPES,
      ...common,
    ]);
    runAnimeStudio([
      blockPath,
      join(directory.layout, basename(block, ".blk")),
      "--types",
      ...LAYOUT_ASSET_TYPES,
      "--export_type",
      "JSON",
      ...common,
    ]);
    console.log(`${block} exported`);
  }
};
