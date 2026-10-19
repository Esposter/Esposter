import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { THUNDERING_FURY_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createThunderingFurySetModule } from "#src/services/artifact/sets/createThunderingFurySetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 2;
const SKILL_COOLDOWN_SECONDS = 5;
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(THUNDERING_FURY_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
const createCombatant = (characterId: number, kit = KIT): Combatant => {
  const attributes = computeCharacterAttributes([]);
  return { ascension: 0, attributes, characterId, constellationCount: 0, elementalResonances: [], kit, level: 1 };
};
// The wearer, who wears four pieces, and another member, in the party order given, with the wearer's skill cooled for
// Seconds. The wearer's kit hears the events the team sends, and reads the reactions a member makes in the party's hooks
const createTeam = (characterIds: number[]) => {
  const wearer = createCombatant(
    TRAVELER_CHARACTER_ID,
    getPassiveKit(KIT, [createThunderingFurySetModule(bonusOf(4))]),
  );
  const other = createCombatant(OTHER_CHARACTER_ID);
  const kitEffectState: KitEffectState = { effects: [] };
  const party = createParty(characterIds);
  getPartyMember(party, TRAVELER_CHARACTER_ID).skillCooldownSeconds = SKILL_COOLDOWN_SECONDS;
  const characterIdCombatantMap = new Map([
    [OTHER_CHARACTER_ID, other],
    [TRAVELER_CHARACTER_ID, wearer],
  ]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const context = createKitTestContext(wearer, { characterIdCombatantMap, kitEffectState, party });
  // The DMG Bonus the wearer's kit adds to a reaction the given member makes, as the party's hook reads it
  const reactionDamageBonus = (combatant: Combatant, reactionType: ReactionType) =>
    wearer.kit.getPartyReactionBonus?.(wearer, { combatant, element: undefined, enemy, reactionType }, context)
      ?.damageBonus ?? 0;
  // A hit the striker lands on the enemy, which triggers the given reactions on it
  const trigger = (striker: Combatant, reactionTypes: ReactionType[], isGadget?: true) =>
    emitKitEvent(
      {
        enemy,
        isGadget,
        kind: KitEventKind.ReactionTriggered,
        reactions: reactionTypes.map((reactionType) => ({ reactionType })),
        striker,
      },
      context,
    );
  const getSkillCooldownSeconds = () => getPartyMember(party, TRAVELER_CHARACTER_ID).skillCooldownSeconds;
  return { context, getSkillCooldownSeconds, other, reactionDamageBonus, trigger, wearer };
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
