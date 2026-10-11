import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createSayuKit } from "#src/services/kit/characters/sayuKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const SAYU_CHARACTER_ID = 10_000_053;
const SAYU_KIT = createSayuKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [SAYU_CHARACTER_ID]));

describe(createSayuKit, () => {
  test("a roll held for its maximum ends in a kick a little under twelve seconds past its start, on a cooldown of eleven", () => {
    expect.hasAssertions();
    const maximumRoll = SAYU_KIT.elementalSkillHolds?.at(-1);
    if (!maximumRoll) throw new Error("Sayu has no roll");
    const kick = maximumRoll.action.hits.at(-1);

    expect(kick?.hitmarkSeconds).toBeCloseTo((67 + 600) / 60);
    expect(maximumRoll.cooldownSeconds).toBeCloseTo(11);
  });
});
