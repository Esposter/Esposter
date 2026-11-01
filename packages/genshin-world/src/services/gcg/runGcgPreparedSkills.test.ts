import { CROWFEATHER_COVER_ID } from "#src/services/gcg/cards/constants";
import { crowfeatherCover } from "#src/services/gcg/cards/crowfeatherCover";
import { createDuel } from "#src/services/gcg/cards/createDuel.test";
import { createSideState } from "#src/services/gcg/cards/createSideState.test";
import { ELECTRO_CHARACTER, PREPARED_SKILL } from "#src/services/gcg/constants.test";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { runGcgPreparedSkills } from "#src/services/gcg/runGcgPreparedSkills";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(runGcgPreparedSkills, () => {
  test("should spend a usage of the Crowfeather Cover its holder's prepared Elemental Skill benefits from", () => {
    expect.hasAssertions();

    const holder = createGcgCharacterState({ character: ELECTRO_CHARACTER });
    const cover = createGcgZoneCard(CROWFEATHER_COVER_ID, crowfeatherCover);
    holder.statuses = [cover];
    const attacker = createSideState([holder]);
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const defender = createSideState([createGcgCharacterState({ character: ELECTRO_CHARACTER })]);
    const duel = createDuel([attacker, defender]);

    runGcgPreparedSkills(duel, 0);

    expect({ coverUsages: cover.usages, defenderHp: takeOne(defender.characters, 0)?.hp }).toStrictEqual({
      coverUsages: 1,
      defenderHp: 6,
    });
  });

  test("should record a prepared skill as used this round, as a skill its character uses is", () => {
    expect.hasAssertions();

    const attacker = createSideState([createGcgCharacterState({ character: ELECTRO_CHARACTER })]);
    attacker.preparedSkills = [{ characterIndex: 0, skill: PREPARED_SKILL }];
    const duel = createDuel([attacker, createSideState([createGcgCharacterState({ character: ELECTRO_CHARACTER })])]);

    runGcgPreparedSkills(duel, 0);

    expect(attacker.usedSkillIds).toStrictEqual([PREPARED_SKILL.id]);
  });
});
