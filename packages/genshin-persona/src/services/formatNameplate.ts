import type { Nameplate } from "#src/models/Nameplate";

import { ANSI_RESET, ElementColorMap, NAMEPLATE_PREFIX } from "#src/services/constants";
import { getAnsiForegroundColor } from "#src/util/getAnsiForegroundColor";

// The name in its element's colour, plain where the element has none: the player character, and a record written
// Before the element was kept
export const formatNameplate = ({ element, name }: Nameplate): string => {
  const nameplate = `${NAMEPLATE_PREFIX}${name}`;
  const color = ElementColorMap[element];
  return color ? `${getAnsiForegroundColor(color)}${nameplate}${ANSI_RESET}` : nameplate;
};
