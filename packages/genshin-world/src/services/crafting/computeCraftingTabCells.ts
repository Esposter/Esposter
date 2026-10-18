import type { CraftingCell } from "genshin-interface";

import { MYSTIC_OFFERING_TAB_ID } from "#src/services/crafting/constants";
import { checkIsMysticOfferingOpen } from "#src/services/crafting/checkIsMysticOfferingOpen";

// The bench's tabs: the recipe tabs in their order, then the Mystic Offering from its Adventure Rank, named by the game's words
export const computeCraftingTabCells = (
  recipeTabs: CraftingCell[],
  adventureRank: number,
  mysticOfferingName: string,
): CraftingCell[] =>
  checkIsMysticOfferingOpen(adventureRank)
    ? [...recipeTabs, { id: MYSTIC_OFFERING_TAB_ID, name: mysticOfferingName }]
    : recipeTabs;
