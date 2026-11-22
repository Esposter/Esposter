import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { ID_SEPARATOR } from "@esposter/shared";

// The key a block and a path ID hold an asset or an object by in memory, joined by the composite-key separator
export const toBlockPathKey = ({ block, pathId }: Pick<IndexedAsset, "block" | "pathId">) =>
  `${block}${ID_SEPARATOR}${pathId}`;
