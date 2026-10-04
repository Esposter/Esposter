import type { Nameplate } from "#src/models/Nameplate";
import type { PersonaCharacter } from "#types";

import { NAMEPLATE_SURFACE } from "#src/services/constants";
import { getNameplateColor } from "#src/services/getNameplateColor";
import { getReadableHexColor } from "#src/util/getReadableHexColor";

// The character's colour lightened in OKLab until it reads on a dark terminal, as the accent the mods draw in
export const getPersonaCharacter = (nameplate: Nameplate): PersonaCharacter => {
  const color = getNameplateColor(nameplate);
  const { displayName, name } = nameplate;
  return { color: color ? getReadableHexColor(color, NAMEPLATE_SURFACE) : "", displayName, name };
};
