import { GameDataKeys } from "#src/generated/gameDataKeys";
import { characterScaleRecordSchema } from "#src/models/character/CharacterScale";
import { CHARACTER_PMX_RECKONED_UNIT_METRES } from "#src/services/character/constants";
import { readGameData } from "#src/services/data/readGameData";
import { getResultAsync } from "@esposter/shared";

// The metres a character's PMX unit stands for: the game's own model's height over the PMX's height where the published
// Measure holds it, else the reckoned unit. A record that fails to read is logged and stands the same way, so a model is
// Never drawn short of its unit by a read that failed
export const getCharacterPmxUnitMetres = (gameDataBaseUrl: string, characterId: number): Promise<number> =>
  getResultAsync(() =>
    readGameData(gameDataBaseUrl, GameDataKeys.characterModels.scale, characterScaleRecordSchema),
  ).match(
    (scaleRecord) => scaleRecord[String(characterId)]?.metresPerUnit ?? CHARACTER_PMX_RECKONED_UNIT_METRES,
    (error) => {
      console.error(error);
      return CHARACTER_PMX_RECKONED_UNIT_METRES;
    },
  );
