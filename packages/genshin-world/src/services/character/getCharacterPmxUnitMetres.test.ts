import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameDataKeys } from "#src/generated/gameDataKeys";
import { characterScaleRecordSchema } from "#src/models/character/CharacterScale";
import { CHARACTER_PMX_RECKONED_UNIT_METRES, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterPmxUnitMetres } from "#src/services/character/getCharacterPmxUnitMetres";
import { readGameData } from "#src/services/data/readGameData";
import { assert, describe, expect, test } from "vitest";

describe(getCharacterPmxUnitMetres, () => {
  test("the Traveler's model stands at its game model's height", async () => {
    expect.hasAssertions();

    const scaleRecord = await readGameData(
      GAME_DATA_LOCAL_BASE_URL,
      GameDataKeys.characterModels.scale,
      characterScaleRecordSchema,
    );
    const travelerScale = scaleRecord[String(TRAVELER_CHARACTER_ID)];
    assert.exists(travelerScale);

    expect(travelerScale.pmxHeightUnits * travelerScale.metresPerUnit).toBeCloseTo(travelerScale.modelHeightMetres, 3);
  });

  test("a character no measure holds keeps the reckoned unit", async () => {
    expect.hasAssertions();

    await expect(getCharacterPmxUnitMetres(GAME_DATA_LOCAL_BASE_URL, 0)).resolves.toBe(
      CHARACTER_PMX_RECKONED_UNIT_METRES,
    );
  });
});
