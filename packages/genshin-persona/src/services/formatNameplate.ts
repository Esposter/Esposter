import type { Nameplate } from "#src/models/Nameplate";

import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { ANSI_RESET, ElementColorMap, NAMEPLATE_PREFIX } from "#src/services/constants";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";

// The name in the character's own colour, the element's for a character with no colour of their own yet, and plain
// Where neither has one: the player character, and a record written before the element was kept. Both are looked
// Up by the English name and element and the name drawn is the interface language's, so a localized nameplate
// Keeps its colour
export const formatNameplate = ({ displayName, element, name }: Nameplate): string => {
  const nameplate = `${NAMEPLATE_PREFIX}${displayName}`;
  const color = CharacterColorMap[name] ?? ElementColorMap[element];
  return color ? `${getAnsiForegroundColor(color)}${nameplate}${ANSI_RESET}` : nameplate;
};
