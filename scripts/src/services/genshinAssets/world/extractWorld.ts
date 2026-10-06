import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { ANIMESTUDIO_UNPARSED_SUFFIX, GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { formatTerrainObj } from "#src/services/genshinAssets/world/formatTerrainObj";
import { parseTerrainHeights } from "#src/services/genshinAssets/world/parseTerrainHeights";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A TerrainData's raw export leads with its name, a length and that many characters
const NAME_OFFSET = 4;
const UNPARSED_FOLDER = "unparsed";
// One block's assets of a type, by their exact names, raw into the component's world folder grouped by type
const exportNamedRaw = (block: string, type: AssetType, names: readonly string[], directory: string): void => {
  runAnimeStudio([
    join(GAME_BLOCKS_DIRECTORY, block),
    directory,
    "--names",
    `^(${names.map((name) => RegExp.escape(name)).join("|")})$`,
    "--types",
    type,
    "--export_type",
    AnimeStudioExportType.Raw,
    "--group_assets",
    AnimeStudioGroupType.ByType,
  ]);
};
// A part of the open world's own data beside its closure: each StreamGen blob and its index raw, and each terrain
// Tile's TerrainData raw with its heightfield written as a mesh among the component's meshes, which the witness draws
// As it draws every export. A TerrainData exports unparsed under a numbered name, so every one of its block is exported
// And kept only where the name inside its bytes is a tile's. Returns what was written, and every tile not found
export const extractWorld = async (component: DerivedAssetComponent): Promise<string[]> => {
  const { world } = DerivedAssetComponentMap[component];
  if (!world) return [];
  const directory = getComponentDirectory(component);
  await rm(directory.world, { force: true, recursive: true });
  await mkdir(directory.world, { recursive: true });
  for (const { blob, index } of world.streams) {
    exportNamedRaw(blob.block, AssetType.MiHoYoBinData, [blob.name], directory.world);
    exportNamedRaw(index.block, AssetType.MonoBehaviour, [index.name], directory.world);
  }
  const terrainDirectory = join(directory.world, AssetType.TerrainData);
  // A block's every TerrainData lands here first, apart from the tiles kept
  const unparsedDirectory = join(directory.world, UNPARSED_FOLDER);
  await mkdir(terrainDirectory, { recursive: true });
  const tileNames = new Set(world.terrainTiles.map(({ name }) => name));
  for (const block of new Set(world.terrainTiles.map((tile) => tile.block))) {
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
      // oxlint-disable-next-line no-await-in-loop -- as above
      if (tileNames.has(name)) await rename(join(exportedDirectory, file), join(terrainDirectory, `${name}.dat`));
    }
    // oxlint-disable-next-line no-await-in-loop -- the next block's exports go in a fresh folder
    await rm(unparsedDirectory, { force: true, recursive: true });
  }
  const meshDirectory = join(directory.assets, AssetType.Mesh);
  await mkdir(meshDirectory, { recursive: true });
  const lines = [`${world.streams.length} streams`];
  for (const name of tileNames) {
    const path = join(terrainDirectory, `${name}.dat`);
    // oxlint-disable-next-line no-await-in-loop -- one tile at a time, each some megabytes
    const heights = existsSync(path) ? parseTerrainHeights(await readFile(path)) : undefined;
    if (!heights) {
      lines.push(`terrain ${name}: no heightfield found`);
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- as above
    await writeFile(join(meshDirectory, `${name}.obj`), formatTerrainObj(name, heights));
    lines.push(`terrain ${name}: ${heights.resolution} samples a side, ${heights.spacing} metres apart`);
  }
  return lines;
};
