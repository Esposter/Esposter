import { ASSET_MAP_NAME, ASSET_MAP_PATH, GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/constants";
import { runAnimeStudio } from "#src/services/genshinAssets/runAnimeStudio";
import { writeAssetIndex } from "#src/services/genshinAssets/writeAssetIndex";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Maps every asset in the game's blocks by name, type and block, which a patch changes and so is rebuilt once each:
// AnimeStudio's CAB and asset maps, then the index a component's search reads
export const buildAssetMap = async (): Promise<void> => {
  const directory = dirname(ASSET_MAP_PATH);
  await mkdir(directory, { recursive: true });
  runAnimeStudio([
    GAME_BLOCKS_DIRECTORY,
    directory,
    "--map_op",
    "Both",
    "--map_type",
    "JSON",
    "--map_name",
    ASSET_MAP_NAME,
  ]);
  const count = await writeAssetIndex();
  console.log(`${count} assets indexed`);
};
