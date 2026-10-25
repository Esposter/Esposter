import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GENSHIN_ANIMESTUDIO_OPTIONS, INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

// One block's namecard textures of a folder, read in one AnimeStudio run by their exact names. AnimeStudio writes each
// Type into a folder of its own, which is moved up beside the others, and a block that yields none is left to the check
export const exportBlockNamecards = (block: string, names: readonly string[], directory: string): void => {
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, block),
      directory,
      "--names",
      `^(${names.map((name) => RegExp.escape(name)).join("|")})$`,
      "--types",
      AssetType.Texture2D,
      "--group_assets",
      AnimeStudioGroupType.ByType,
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const typeDirectory = join(directory, AssetType.Texture2D);
  if (!existsSync(typeDirectory)) return;
  for (const file of readdirSync(typeDirectory)) renameSync(join(typeDirectory, file), join(directory, file));
  rmSync(typeDirectory, { recursive: true });
};
