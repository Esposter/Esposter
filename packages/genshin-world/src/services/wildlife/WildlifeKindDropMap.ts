import type { DroppedItem } from "#src/models/enemy/DroppedItem";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";

// What each bird and beast gives when struck down, by the game's item ids as the wiki's Wildlife page gives them: a White
// Pigeon one Fowl, a Squirrel one Raw Meat and a Crimson Fox two Raw Meat
export const WildlifeKindDropMap: Record<WildlifeKind, DroppedItem> = {
  [WildlifeKind.CrimsonFox]: { count: 2, itemId: 100_061 },
  [WildlifeKind.Squirrel]: { count: 1, itemId: 100_061 },
  [WildlifeKind.WhitePigeon]: { count: 1, itemId: 100_064 },
};
