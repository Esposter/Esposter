import type { Nameplate } from "#src/models/Nameplate";

import { ElementColorMap } from "#src/generated/genshinText/services/ElementColorMap";
import { CharacterColorMap } from "#src/services/CharacterColorMap";

// The character's own colour, else their element's, "" where neither has one. Both use stable English identifiers,
// So a localized nameplate keeps its colour
export const getNameplateColor = ({ element, name }: Pick<Nameplate, "element" | "name">): string =>
  CharacterColorMap[name] ?? ElementColorMap[element] ?? "";
