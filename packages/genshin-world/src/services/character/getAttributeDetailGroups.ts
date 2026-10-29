import type { Attribute } from "#src/models/character/Attribute";
import type { AttributeDetailRow } from "#src/models/character/AttributeDetailRow";
import type { GameText } from "genshin-text";

import {
  ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  BASE_ATTRIBUTE_GAME_TEXT_KEYS,
  ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
} from "#src/services/character/constants";
import { formatAttributeValue } from "#src/services/character/formatAttributeValue";
import { GameTextKey } from "genshin-text";

export interface AttributeDetailGroup {
  rows: AttributeDetailRow[];
  title: string;
}

// The Details list's three groups, each under the game's title for it, with every attribute's total under the game's
// Name for it: whole for the bases, a percentage to one place for the rest. Nothing is listed while Details is closed
export const getAttributeDetailGroups = (
  attributeTotalMap: Readonly<Record<Attribute, number>>,
  gameText: GameText,
  isOpen: boolean,
): AttributeDetailGroup[] => {
  if (!isOpen) return [];
  const toRows = (attributeGameTextKeys: readonly (readonly [Attribute, GameTextKey])[]): AttributeDetailRow[] =>
    attributeGameTextKeys.map(([attribute, gameTextKey]) => ({
      label: gameText[gameTextKey],
      value: formatAttributeValue(attribute, attributeTotalMap[attribute]),
    }));
  return [
    { rows: toRows(BASE_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupBase] },
    { rows: toRows(ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupAdvanced] },
    { rows: toRows(ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupElemental] },
  ];
};
