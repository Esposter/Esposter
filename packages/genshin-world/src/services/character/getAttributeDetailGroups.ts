import type { Attribute } from "#src/models/character/Attribute";
import type { GameText } from "genshin-text";

import {
  ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  BASE_ATTRIBUTE_GAME_TEXT_KEYS,
  ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
  WHOLE_ATTRIBUTES,
} from "#src/services/character/constants";
import { GameTextKey } from "genshin-text";

export interface AttributeDetailGroup {
  rows: AttributeDetailRow[];
  title: string;
}

export interface AttributeDetailRow {
  label: string;
  value: string;
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
      value: WHOLE_ATTRIBUTES.includes(attribute)
        ? `${Math.round(attributeTotalMap[attribute])}`
        : `${(attributeTotalMap[attribute] * 100).toFixed(1)}%`,
    }));
  return [
    { rows: toRows(BASE_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupBase] },
    { rows: toRows(ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupAdvanced] },
    { rows: toRows(ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS), title: gameText[GameTextKey.AttributeGroupElemental] },
  ];
};
