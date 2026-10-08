import type { WorldStream } from "#src/models/genshinAssets/world/WorldStream";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { join } from "node:path";

// One block's assets of a type, by their exact names, raw into a folder grouped by type
export const exportNamedRaw = (block: string, type: AssetType, names: readonly string[], directory: string): void => {
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
// Each StreamGen blob and its index of the streams, raw into the component's world folder, where the placements are
// Read from them (`readWorldPlacements`)
export const exportWorldStreams = (streams: readonly WorldStream[], directory: string): void => {
  for (const { blob, index } of streams) {
    exportNamedRaw(blob.block, AssetType.MiHoYoBinData, [blob.name], directory);
    exportNamedRaw(index.block, AssetType.MonoBehaviour, [index.name], directory);
  }
};
