import type { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import type { AssetType } from "#src/models/genshinAssets/shared/AssetType";

import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { GENSHIN_ANIMESTUDIO_OPTIONS, INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

// One block's objects of a type read by their exact names in one AnimeStudio run, each written to the directory under its
// Name (as a PNG unless an export type is given). AnimeStudio writes a type into a folder of its own, which is moved up
// Beside the others, and a block that yields none is left to the caller's check
export const exportBlockByName = (
  block: string,
  type: AssetType,
  names: readonly string[],
  directory: string,
  exportType?: AnimeStudioExportType,
): void => {
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, block),
      directory,
      "--names",
      `^(${names.map((name) => RegExp.escape(name)).join("|")})$`,
      "--types",
      type,
      ...(exportType ? ["--export_type", exportType] : []),
      "--group_assets",
      AnimeStudioGroupType.ByType,
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const typeDirectory = join(directory, type);
  if (!existsSync(typeDirectory)) return;
  for (const file of readdirSync(typeDirectory)) renameSync(join(typeDirectory, file), join(directory, file));
  rmSync(typeDirectory, { recursive: true });
};
