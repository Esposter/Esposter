import type { WorldStream } from "#src/models/genshinAssets/world/WorldStream";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { exportNamedRaw } from "#src/services/genshinAssets/world/exportNamedRaw";

// Each StreamGen blob and its index of the streams, raw into the component's world folder, where the placements are
// Read from them (`readWorldPlacements`)
export const exportWorldStreams = (streams: readonly WorldStream[], directory: string): void => {
  for (const { blob, index } of streams) {
    exportNamedRaw(blob.block, AssetType.MiHoYoBinData, [blob.name], directory);
    exportNamedRaw(index.block, AssetType.MonoBehaviour, [index.name], directory);
  }
};
