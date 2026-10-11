import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createSayuKitBehaviour, SAYU_CHARACTER_ID } from "#src/services/kit/characters/sayuKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const SAYU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SAYU_CHARACTER_ID);

describe(createSayuKitBehaviour, () => {
  test("a roll held for its maximum ends in a kick a little under twelve seconds past its start, on a cooldown of eleven", () => {
    expect.hasAssertions();
    const maximumRoll = SAYU_KIT.elementalSkillHolds?.at(-1);
    if (!maximumRoll) throw new Error("Sayu has no roll");
    const kick = maximumRoll.action.hits.at(-1);

    expect(kick?.hitmarkSeconds).toBeCloseTo((67 + 600) / 60);
    expect(maximumRoll.cooldownSeconds).toBeCloseTo(11);
  });
});
