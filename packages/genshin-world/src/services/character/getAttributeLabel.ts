import type { Attribute } from "#src/models/character/Attribute";
import type { GameText } from "genshin-text";

import { AttributeLabelGameTextKeyMap } from "#src/services/character/AttributeLabelGameTextKeyMap";

// An attribute's name in the game's words, which the lists caption their rows with. An attribute the map names no caption
// For is absent, the empty string the lists leave undrawn
export const getAttributeLabel = (attribute: Attribute, gameText: GameText): string => {
  const gameTextKey = AttributeLabelGameTextKeyMap.get(attribute);
  return gameTextKey === undefined ? "" : gameText[gameTextKey];
};
