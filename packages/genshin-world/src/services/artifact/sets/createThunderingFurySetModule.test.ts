import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { THUNDERING_FURY_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createReactionSetTeam } from "#src/services/artifact/sets/createReactionSetTeam.test";
import { createThunderingFurySetModule } from "#src/services/artifact/sets/createThunderingFurySetModule";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const OTHER_CHARACTER_ID = 2;
const SKILL_COOLDOWN_SECONDS = 5;
// The team with the wearer's skill cooled for SKILL_COOLDOWN_SECONDS seconds
const createTeam = (characterIds: number[]) => {
  const team = createReactionSetTeam(
    createThunderingFurySetModule(getArtifactSetBonus(statTables, THUNDERING_FURY_ARTIFACT_SET_ID, 4)),
    characterIds,
  );
  getPartyMember(team.context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds = SKILL_COOLDOWN_SECONDS;
  const getSkillCooldownSeconds = () => getPartyMember(team.context.party, TRAVELER_CHARACTER_ID).skillCooldownSeconds;
  return { ...team, getSkillCooldownSeconds };
};

const CUT_REACTION_TYPES: ReactionType[] = [
  TransformativeReactionType.Overloaded,
  TransformativeReactionType.ElectroCharged,
  TransformativeReactionType.Superconduct,
  TransformativeReactionType.Hyperbloom,
  CatalyzeReactionType.Aggravate,
  LunarReactionType.LunarCharged,
  ReactionType.StellarConduct,
  ReactionType.Quicken,
];

describe(createThunderingFurySetModule, () => {
  test("the wearer's own Overloaded, Electro-Charged, Superconduct and Hyperbloom DMG is raised by 40%, and another member's is not", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    for (const reactionType of [
      TransformativeReactionType.Overloaded,
      TransformativeReactionType.ElectroCharged,
      TransformativeReactionType.Superconduct,
      TransformativeReactionType.Hyperbloom,
    ]) {
      expect(reactionDamageBonus(wearer, reactionType)).toBeCloseTo(0.4);
      expect(reactionDamageBonus(other, reactionType)).toBe(0);
    }
  });

  test("the wearer's own Aggravate DMG is raised by 20%, its Lunar-Charged DMG by 20%, and a Swirl by neither", () => {
    expect.hasAssertions();

    const { other, reactionDamageBonus, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);

    expect(reactionDamageBonus(wearer, CatalyzeReactionType.Aggravate)).toBeCloseTo(0.2);
    expect(reactionDamageBonus(wearer, LunarReactionType.LunarCharged)).toBeCloseTo(0.2);
    expect(reactionDamageBonus(other, CatalyzeReactionType.Aggravate)).toBe(0);
    expect(reactionDamageBonus(wearer, TransformativeReactionType.Swirl)).toBe(0);
  });

  test("each reaction the active wearer triggers, or Quicken, cuts its Elemental Skill cooldown by a second", () => {
    expect.hasAssertions();

    for (const reactionType of CUT_REACTION_TYPES) {
      const { getSkillCooldownSeconds, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
      trigger(wearer, [reactionType]);

      expect(getSkillCooldownSeconds()).toBeCloseTo(SKILL_COOLDOWN_SECONDS - 1);
    }
  });

  test("a cut the wearer makes waits 0.8 seconds before the next, and the cooldown is cut again after it", () => {
    expect.hasAssertions();

    const { context, getSkillCooldownSeconds, trigger, wearer } = createTeam([
      TRAVELER_CHARACTER_ID,
      OTHER_CHARACTER_ID,
    ]);
    trigger(wearer, [ReactionType.Quicken]);
    trigger(wearer, [ReactionType.Quicken]);

    expect(getSkillCooldownSeconds()).toBeCloseTo(SKILL_COOLDOWN_SECONDS - 1);

    stepKitSeconds(context, 0.8);
    trigger(wearer, [ReactionType.Quicken]);

    expect(getSkillCooldownSeconds()).toBeCloseTo(SKILL_COOLDOWN_SECONDS - 2);
  });

  test("a reaction the wearer triggers off the field cuts no cooldown, though its own DMG bonus still applies", () => {
    expect.hasAssertions();

    const { getSkillCooldownSeconds, reactionDamageBonus, trigger, wearer } = createTeam([
      OTHER_CHARACTER_ID,
      TRAVELER_CHARACTER_ID,
    ]);
    trigger(wearer, [ReactionType.Quicken]);

    expect(reactionDamageBonus(wearer, TransformativeReactionType.Overloaded)).toBeCloseTo(0.4);
    expect(getSkillCooldownSeconds()).toBe(SKILL_COOLDOWN_SECONDS);
  });

  test("a reaction another member triggers, or a Swirl the wearer triggers, cuts no cooldown", () => {
    expect.hasAssertions();

    const { getSkillCooldownSeconds, other, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    trigger(other, [ReactionType.Quicken]);
    trigger(wearer, [TransformativeReactionType.Swirl]);

    expect(getSkillCooldownSeconds()).toBe(SKILL_COOLDOWN_SECONDS);
  });

  test("a reaction a gadget of the wearer's triggers cuts no cooldown, but a Hyperbloom it triggers does", () => {
    expect.hasAssertions();

    const { getSkillCooldownSeconds, trigger, wearer } = createTeam([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
    trigger(wearer, [TransformativeReactionType.Overloaded], true);

    expect(getSkillCooldownSeconds()).toBe(SKILL_COOLDOWN_SECONDS);

    trigger(wearer, [TransformativeReactionType.Hyperbloom], true);

    expect(getSkillCooldownSeconds()).toBeCloseTo(SKILL_COOLDOWN_SECONDS - 1);
  });
});
