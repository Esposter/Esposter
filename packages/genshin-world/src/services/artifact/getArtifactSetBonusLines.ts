import type { ActiveArtifactSetBonus } from "#src/models/artifact/ActiveArtifactSetBonus";
import type { GameText } from "genshin-text";

import { fillGameTextValues, GameTextKey } from "genshin-text";

// Each set bonus the worn artifacts reach as its line: the piece count it is active from and the game's words for its
// Effect, read from the names record by its text hash. A bonus whose words the names do not hold has an empty effect
export const getArtifactSetBonusLines = (
  activeBonuses: readonly ActiveArtifactSetBonus[],
  gameText: GameText,
  nameText: Readonly<Record<string, string>>,
): string[] =>
  activeBonuses.map(({ descriptionTextHash, pieceCount }) =>
    fillGameTextValues(gameText[GameTextKey.ArtifactSetBonusLine], pieceCount, nameText[descriptionTextHash] || ""),
  );
