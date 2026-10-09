import type { SubCommandsDef } from "citty";

import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { writeGcgDeck } from "#src/services/genshinAssets/gcg/writeGcgDeck";
import { writeGcgGames } from "#src/services/genshinAssets/gcg/writeGcgGames";
import { writeGcgStandardRule } from "#src/services/genshinAssets/gcg/writeGcgStandardRule";
import { defineCommand } from "citty";

export const gcgCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the standard duel rule, the opponent decks and the duels' games from the dump into genshin-world",
    name: "gcg",
  },
  run: () => {
    writeGcgStandardRule();
    writeGcgGames();
    for (const [deckId, createdCardIds] of GcgDeckIdCreatedCardIdsMap) writeGcgDeck(deckId, createdCardIds);
  },
});
