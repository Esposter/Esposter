import { CHARACTER_PMX_RECKONED_UNIT_METRES, CHARACTER_PMX_UNIT_METRES } from "#src/services/character/constants";

// The metres a character's PMX unit stands for: the game's own model's height over the PMX's height where it is measured,
// Else the reckoned unit
export const getCharacterPmxUnitMetres = (characterId: number): number =>
  CHARACTER_PMX_UNIT_METRES.get(characterId) ?? CHARACTER_PMX_RECKONED_UNIT_METRES;
