import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgCostRow } from "#src/models/genshinAssets/gcg/ExcelGcgCostRow";
import type { ExcelGcgDeckRow } from "#src/models/genshinAssets/gcg/ExcelGcgDeckRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type { GcgDeckSlice } from "#src/models/genshinAssets/shared/GcgDeckSlice";

import { findRow } from "#src/services/genshinAssets/gcg/findRow";
import { toCard } from "#src/services/genshinAssets/gcg/toCard";
import { toCharacter } from "#src/services/genshinAssets/gcg/toCharacter";

// A deck's slice, read from the dump's deck, character, skill and card rows. Its cards are the deck's distinct cards and
// The cards its skills create, each with its name and description text ids and the effect names its skills carry
export const toGcgDeck = (
  deckRow: ExcelGcgDeckRow,
  characterRows: ExcelGcgCharRow[],
  skillRows: ExcelGcgSkillRow[],
  cardRows: ExcelGcgCardRow[],
  createdCardIds: number[],
  costRows: ExcelGcgCostRow[],
): GcgDeckSlice => {
  const costTypes = new Set(costRows.map(({ type }) => type));
  const characters = deckRow.characterList.map((characterId) => {
    const characterRow = findRow(characterRows, characterId, "character");
    return toCharacter(characterRow, skillRows, costTypes);
  });
  const cardIds = [...new Set([...deckRow.cardList, ...createdCardIds])];
  return {
    cardIds: deckRow.cardList,
    cards: cardIds.map((cardId) => toCard(findRow(cardRows, cardId, "card"), skillRows, costTypes)),
    characterIds: deckRow.characterList,
    characters,
  };
};
