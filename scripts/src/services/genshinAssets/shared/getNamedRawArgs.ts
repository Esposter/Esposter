import type { AssetType } from "#src/models/genshinAssets/shared/AssetType";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The command line that exports one block's assets of a type, by their exact names, raw into a folder grouped by type
export const getNamedRawArgs = (
  block: string,
  type: AssetType,
  names: readonly string[],
  directory: string,
): string[] => [
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
];
