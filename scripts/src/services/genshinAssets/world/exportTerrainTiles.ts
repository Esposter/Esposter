import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { ANIMESTUDIO_UNPARSED_SUFFIX, GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";

// A TerrainData's raw export leads with its name, a length and that many characters
const NAME_OFFSET = 4;
const UNPARSED_FOLDER = "unparsed";
// Each terrain tile's TerrainData, found by the name inside its bytes rather than the file's, since a block exports
// Every TerrainData under a numbered name. Every candidate block is exported in turn and its TerrainData kept where
// The name is a tile's, as `<name>.dat` in the world folder's TerrainData. Returns the block each tile was found in
export const exportTerrainTiles = async (
  names: readonly string[],
  candidateBlocks: readonly string[],
  directory: string,
): Promise<Map<string, string>> => {
  const terrainDirectory = join(directory, AssetType.TerrainData);
  // A block's every TerrainData lands here first, apart from the tiles kept
  const unparsedDirectory = join(directory, UNPARSED_FOLDER);
  const tileNames = new Set(names);
  const foundBlocks = new Map<string, string>();
  await mkdir(terrainDirectory, { recursive: true });
  for (const block of candidateBlocks) {
    // Every tile found, the blocks still to come are not read
    if (foundBlocks.size === tileNames.size) break;
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      unparsedDirectory,
      "--types",
      `${AssetType.TerrainData}${ANIMESTUDIO_UNPARSED_SUFFIX}`,
      "--export_type",
      AnimeStudioExportType.Raw,
      "--group_assets",
      AnimeStudioGroupType.ByType,
    ]);
    const exportedDirectory = join(unparsedDirectory, AssetType.TerrainData);
    if (!existsSync(exportedDirectory)) continue;
    // oxlint-disable-next-line no-await-in-loop -- a block's exports are read once AnimeStudio has written them
    for (const file of await readdir(exportedDirectory)) {
      // oxlint-disable-next-line no-await-in-loop -- one tile at a time, each some megabytes
      const bytes = await readFile(join(exportedDirectory, file));
      const name = bytes.toString("utf8", NAME_OFFSET, NAME_OFFSET + bytes.readUInt32LE(0));
      if (!tileNames.has(name) || foundBlocks.has(name)) continue;
      // oxlint-disable-next-line no-await-in-loop -- as above
      await rename(join(exportedDirectory, file), join(terrainDirectory, `${name}.dat`));
      foundBlocks.set(name, block);
    }
    // oxlint-disable-next-line no-await-in-loop -- the next block's exports go in a fresh folder
    await rm(unparsedDirectory, { force: true, recursive: true });
  }
  return foundBlocks;
};
