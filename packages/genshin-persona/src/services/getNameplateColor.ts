import type { Nameplate } from "#src/models/Nameplate";

import { CharacterColorMap } from "#src/services/CharacterColorMap";
import { ElementColorMap } from "#src/services/constants";

// The character's own colour, else their element's, "" where neither has one: the player character, and a record
// Written before the element was kept. Both are looked up by the English name and element, so a localized nameplate
// Keeps its colour
export const getNameplateColor = ({ element, name }: Pick<Nameplate, "element" | "name">): string =>
  CharacterColorMap[name] ?? ElementColorMap[element] ?? "";
