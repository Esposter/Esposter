import type { Nameplate } from "#src/models/Nameplate";

import { CharacterColorMap } from "#src/services/CharacterColorMap";
import {
  ANSI_RESET,
  ElementColorMap,
  NAMEPLATE_PREFIX,
  NAMEPLATE_SURFACE,
  NAMEPLATE_TONAL_MIX_PERCENTAGE,
} from "#src/services/constants";
import { getAnsiBackgroundColor } from "#src/util/getAnsiBackgroundColor";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { getMixedHexColor } from "#src/util/getMixedHexColor";
import { getReadableHexColor } from "#src/util/getReadableHexColor";

// The name in the character's own colour on a badge of that colour's tone, the element's for a character with no
// Colour of their own yet, and plain where neither has one: the player character, and a record written before the
// Element was kept. The badge carries its own contrast, so the name reads the same on any terminal background,
// Which a status line command cannot ask for: its output is piped, so it has no terminal to query. Both colours are
// Looked up by the English name and element and the name drawn is the interface language's, so a localized
// Nameplate keeps its colour
export const formatNameplate = ({ displayName, element, name }: Nameplate): string => {
  const nameplate = `${NAMEPLATE_PREFIX}${displayName}`;
  const color = CharacterColorMap[name] ?? ElementColorMap[element];
  if (!color) return nameplate;
  const background = getMixedHexColor(color, NAMEPLATE_TONAL_MIX_PERCENTAGE, NAMEPLATE_SURFACE);
  const readableColor = getReadableHexColor(color, background);
  return `${getAnsiBackgroundColor(background)}${getAnsiForegroundColor(readableColor)} ${nameplate} ${ANSI_RESET}`;
};
