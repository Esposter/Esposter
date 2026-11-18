import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameDataKeys } from "#src/generated/gameDataKeys";
import { characterScaleRecordSchema } from "#src/models/character/CharacterScale";
import { CHARACTER_PMX_RECKONED_UNIT_METRES, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterPmxUnitMetres } from "#src/services/character/getCharacterPmxUnitMetres";
import { readGameData } from "#src/services/data/readGameData";
import { noop } from "@esposter/shared";
import { assert, describe, expect, test, vi } from "vitest";

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

  test("a scale record that fails to read is logged and the character keeps the reckoned unit", async () => {
    expect.hasAssertions();

    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);

    await expect(getCharacterPmxUnitMetres("http://127.0.0.1:9", TRAVELER_CHARACTER_ID)).resolves.toBe(
      CHARACTER_PMX_RECKONED_UNIT_METRES,
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
