import type { WorldStream } from "#src/models/genshinAssets/world/WorldStream";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { getNamedRawArgs } from "#src/services/genshinAssets/shared/getNamedRawArgs";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";

// One block's assets of a type, by their exact names, raw into a folder grouped by type
export const exportNamedRaw = (block: string, type: AssetType, names: readonly string[], directory: string): void => {
  runAnimeStudio(getNamedRawArgs(block, type, names, directory));
};
// Each StreamGen blob and its index of the streams, raw into the component's world folder, where the placements are
// Read from them (`readWorldPlacements`)
export const exportWorldStreams = (streams: readonly WorldStream[], directory: string): void => {
  for (const { blob, index } of streams) {
    exportNamedRaw(blob.block, AssetType.MiHoYoBinData, [blob.name], directory);
    exportNamedRaw(index.block, AssetType.MonoBehaviour, [index.name], directory);
  }
};
