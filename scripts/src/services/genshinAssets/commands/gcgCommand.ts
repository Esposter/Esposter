import type { SubCommandsDef } from "citty";

import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { writeGcgStandardRule } from "#src/services/genshinAssets/gcg/writeGcgStandardRule";
import { writeGcgDeck } from "#src/services/genshinAssets/gcg/writeGcgDeck";
import { defineCommand } from "citty";

export const gcgCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write the standard duel rule and the opponent decks from the dump into genshin-world",
    name: "gcg",
  },
  run: () => {
    writeGcgStandardRule();
    for (const [deckId, createdCardIds] of GcgDeckIdCreatedCardIdsMap) writeGcgDeck(deckId, createdCardIds);
  },
});
