import type { GcgDeckSlice } from "#src/models/genshinAssets/gcg/GcgDeckSlice";

import { GCG_GENERATED_DIRECTORY, GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { GCG_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { writeTextChunks } from "#src/services/genshinText/writeTextChunks";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguages } from "genshin-text";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every name and description the opponent decks' slices name by text id, each character's and each action card's, as
// `genshin:assets gcg` last wrote them, into the world's own chunk per language
export const writeGcgText = (): string[] => {
  const slices = Array.from(GcgDeckIdCreatedCardIdsMap.keys(), (deckId) =>
    parseMachineJson<GcgDeckSlice>(readFileSync(join(GCG_GENERATED_DIRECTORY, `deck${deckId}.json`), "utf8")),
  );
  const textIds = [
    ...new Set(
      slices.flatMap(({ cards, characters }) =>
        [...cards, ...characters].flatMap(({ descriptionTextId, nameTextId }) => [nameTextId, descriptionTextId]),
      ),
    ),
  ]
    .map(String)
    .toSorted();
  const notes = writeTextChunks(GCG_TEXT_DIRECTORY, textIds);
  notes.push(`${textIds.length} texts written in ${GameLanguages.length} languages`);
  return notes;
};
