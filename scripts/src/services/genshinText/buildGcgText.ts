import type { GcgDeckSlice } from "#src/models/genshinAssets/gcg/GcgDeckSlice";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

// Every name and description the opponent decks' published slices name by text id, each character's and each action card's,
// Published into the world's own chunk per language
export const buildGcgText = async (): Promise<{ notes: string[]; objects: Record<string, unknown> }> => {
  const slices = await Promise.all(
    Array.from(GcgDeckIdCreatedCardIdsMap.keys(), (deckId) =>
      readPublishedGameData<GcgDeckSlice>(`${GameDataset.Gcg}/deck${deckId}`),
    ),
  );
  const textIds = Array.from(
    new Set(
      slices.flatMap(({ cards, characters }) =>
        [...cards, ...characters].flatMap(({ descriptionTextId, nameTextId }) => [nameTextId, descriptionTextId]),
      ),
    ),
    String,
  ).toSorted();
  const { notes, objects } = buildTextChunks(GameDataset.GcgText, textIds);
  notes.push(`${textIds.length} texts in ${GameLanguages.length} languages`);
  return { notes, objects };
};
