import { CHARACTER_PMX_UNIT_METRES } from "#src/services/character/constants";
import { PMX_UNIT_METRES } from "genshin-engine";

// The metres a character's PMX unit stands for: the game's own model's height over the PMX's height where it is measured,
// Else the community's reckoned unit
export const getCharacterPmxUnitMetres = (characterId: number): number =>
  CHARACTER_PMX_UNIT_METRES.get(characterId) ?? PMX_UNIT_METRES;
