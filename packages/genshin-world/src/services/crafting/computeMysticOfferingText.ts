import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";

import { fillGameTextValues } from "genshin-text";

// The strongboxes one Mystic Offering makes, the count the confirm names
const STRONGBOX_COUNT_PER_OFFERING = 1;

// A Mystic Offering word with the picked strongbox filled in: its artifacts' count and star rank, the count it makes and its
// Name in the reader's language. With no strongbox picked, the artifact counts are zero and the name is empty
export const computeMysticOfferingText = (
  text: string,
  strongbox: CraftingStrongboxData | undefined,
  names: Readonly<Record<string, string>>,
): string =>
  fillGameTextValues(
    text,
    strongbox?.needCount ?? 0,
    strongbox?.rarity ?? 0,
    STRONGBOX_COUNT_PER_OFFERING,
    strongbox === undefined ? "" : (names[strongbox.nameTextId] ?? ""),
  );
