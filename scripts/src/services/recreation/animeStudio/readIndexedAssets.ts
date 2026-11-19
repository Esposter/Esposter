import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { readIndexedAssetRows } from "#src/services/recreation/animeStudio/readIndexedAssetRows";
import { readMatchingEntries } from "#src/services/shared/readMatchingEntries";

// Every asset of the index the predicate keeps, in file order, with only the kept rows held
export const readIndexedAssets = (
  predicate: (asset: IndexedAsset) => boolean,
  options: Pick<AnimeStudioOptions, "indexCommand" | "indexPath">,
): Promise<IndexedAsset[]> => Array.fromAsync(readMatchingEntries([readIndexedAssetRows(options)], predicate));
