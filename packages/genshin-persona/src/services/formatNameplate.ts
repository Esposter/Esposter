import type { Nameplate } from "#src/models/Nameplate";

import { ANSI_RESET, ElementColorMap, NAMEPLATE_PREFIX } from "#src/services/constants";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";

// The name in its element's colour, plain where the element has none: the player character, and a record written
// Before the element was kept. The colour is looked up by the English element and the name drawn is the interface
// Language's, so a localized nameplate keeps its colour
export const formatNameplate = ({ displayName, element }: Nameplate): string => {
  const nameplate = `${NAMEPLATE_PREFIX}${displayName}`;
  const color = ElementColorMap[element];
  return color ? `${getAnsiForegroundColor(color)}${nameplate}${ANSI_RESET}` : nameplate;
};
