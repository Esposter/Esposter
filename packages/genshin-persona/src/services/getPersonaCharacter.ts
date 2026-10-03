import type { Nameplate } from "#src/models/Nameplate";
import type { PersonaCharacter } from "#types";

import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { ElementColorMap, NAMEPLATE_PREFIX, NAMEPLATE_SURFACE } from "#src/services/constants";
import { getReadableHexColor } from "#src/util/getReadableHexColor";

// The character's own colour, else their element's, lightened in OKLab until it reads on a dark terminal: the engine
// Draws a plugin's status line as plain text, so the colour reaches the screen as the accent the mods draw in rather
// Than as a badge behind the name. Both colours are looked up by the English name and element, and the name drawn is
// The interface language's, so a localized character keeps their colour
export const getPersonaCharacter = ({ displayName, element, name }: Nameplate): PersonaCharacter => {
  const color = CharacterColorMap[name] ?? ElementColorMap[element];
  return {
    color: color ? getReadableHexColor(color, NAMEPLATE_SURFACE) : "",
    displayName,
    line: `${NAMEPLATE_PREFIX}${displayName}`,
    name,
  };
};
