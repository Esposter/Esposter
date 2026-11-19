import type { AnimeStudioOptions } from "#src/models/recreation/animeStudio/AnimeStudioOptions";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";

// The asset index's rows whose name the pattern matches, in file order, each with its type, block and path ID
export const readAssetsMatching = (
  pattern: RegExp,
  options: Pick<AnimeStudioOptions, "indexCommand" | "indexPath">,
): Promise<IndexedAsset[]> => readIndexedAssets(({ name }) => pattern.test(name), options);
