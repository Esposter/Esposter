import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";

import { fillGameTextValues } from "genshin-text";

// A Mystic Offering word with the counts of the picked strongbox filled in, its artifacts' count and their star rank, and
// Zero for each where no strongbox is picked
export const computeMysticOfferingText = (text: string, strongbox: CraftingStrongboxData | undefined): string =>
  fillGameTextValues(text, strongbox?.needCount ?? 0, strongbox?.rarity ?? 0);
