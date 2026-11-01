import type { WishEventKind } from "#src/models/genshinAssets/wish/WishEventKind";

import { readFeaturedNames } from "#src/services/genshinAssets/wish/readFeaturedNames";
import { readValue } from "#src/services/genshinAssets/wish/readValue";
import { WishEventKindFeaturedParametersMap } from "#src/services/genshinAssets/wish/WishEventKindFeaturedParametersMap";

// Whether an Item Pool holds the featured five-stars of a kind of banner, which is what settles a page's type
export const checkHasFeaturedFiveStars = (poolParameters: Map<string, string[]>, kind: WishEventKind): boolean =>
  readFeaturedNames(readValue(poolParameters, WishEventKindFeaturedParametersMap[kind].fiveStar) ?? "").length > 0;
