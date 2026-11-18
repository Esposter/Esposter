import { GameDataKeys } from "#src/generated/gameDataKeys";
import { characterScaleRecordSchema } from "#src/models/character/CharacterScale";
import { CHARACTER_PMX_RECKONED_UNIT_METRES } from "#src/services/character/constants";
import { readGameData } from "#src/services/data/readGameData";

// The metres a character's PMX unit stands for: the game's own model's height over the PMX's height where the published
// Measure holds it, else the reckoned unit
export const getCharacterPmxUnitMetres = async (gameDataBaseUrl: string, characterId: number): Promise<number> => {
  const scaleRecord = await readGameData(
    gameDataBaseUrl,
    GameDataKeys.characterModels.scale,
    characterScaleRecordSchema,
  );
  return scaleRecord[String(characterId)]?.metresPerUnit ?? CHARACTER_PMX_RECKONED_UNIT_METRES;
};
