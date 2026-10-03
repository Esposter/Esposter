import type { Nameplate } from "#src/models/Nameplate";

import {
  ANSI_RESET,
  NAMEPLATE_PREFIX,
  NAMEPLATE_SURFACE,
  NAMEPLATE_TONAL_MIX_PERCENTAGE,
} from "#src/services/constants";
import { getNameplateColor } from "#src/services/getNameplateColor";
import { getAnsiBackgroundColor } from "#src/util/getAnsiBackgroundColor";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";
import { getMixedHexColor } from "#src/util/getMixedHexColor";
import { getReadableHexColor } from "#src/util/getReadableHexColor";

// The status line's nameplate: the name in the character's colour on a badge of that colour's tone, and plain where
// They have none. The badge carries its own contrast, so the name reads the same on any terminal background, which a
// Status line command cannot ask for: its output is piped, so it has no terminal to query
export const formatNameplate = (nameplate: Nameplate): string => {
  const text = `${NAMEPLATE_PREFIX}${nameplate.displayName}`;
  const color = getNameplateColor(nameplate);
  if (!color) return text;

  const background = getMixedHexColor(color, NAMEPLATE_TONAL_MIX_PERCENTAGE, NAMEPLATE_SURFACE);
  const readableColor = getReadableHexColor(color, background);
  return `${getAnsiBackgroundColor(background)}${getAnsiForegroundColor(readableColor)} ${text} ${ANSI_RESET}`;
};
