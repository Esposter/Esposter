import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createSpotlessHeartPassiveModule } from "#src/services/weapon/passives/createSpotlessHeartPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseDefense, value: 800 },
    { attribute: Attribute.Defense, value: 100 },
  ]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Spotless Heart at its first rank: forty per cent of the wielder's DEF
const spotlessHeartPassiveModule = createSpotlessHeartPassiveModule([0.4, 4000, 1.5, 0.1]);
const SKILL_USED = { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const };
const createSkillDamageTaken = () => ({
  attackTag: AttackTag.ElementalSkill,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});

describe(createSpotlessHeartPassiveModule, () => {
  test("a skill's strike gains the rank's share of DEF as base damage once the skill is used, and a normal attack gains none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    spotlessHeartPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);

    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0.4 * wielder.attributes.defense);
    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });

  test("the share is the wielder's DEF with its buffs on", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    spotlessHeartPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
    buffKitMember(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: 0.5,
      attribute: Attribute.DefensePercent,
      secondsRemaining: 10,
      source: "test",
    });
    const { attributeTotalMap } = wielder.attributes;
    const buffedDefense =
      attributeTotalMap[Attribute.BaseDefense] * (1 + attributeTotalMap[Attribute.DefensePercent] + 0.5) +
      attributeTotalMap[Attribute.Defense];

    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBeCloseTo(0.4 * buffedDefense);
  });

  test("the effect stands until 0.1 seconds after the skill's last hit", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    spotlessHeartPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
    spotlessHeartPassiveModule.onKitEvent?.(createSkillDamageTaken(), context, wielder);
    stepKitSeconds(context, 0.05);

    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0.4 * wielder.attributes.defense);

    stepKitSeconds(context, 0.2);

    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });

  test("a use inside the cooldown triggers nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    spotlessHeartPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);
    spotlessHeartPassiveModule.onKitEvent?.(createSkillDamageTaken(), context, wielder);
    stepKitSeconds(context, 0.5);
    spotlessHeartPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);

    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);

    stepKitSeconds(context, 1.2);
    spotlessHeartPassiveModule.onKitEvent?.(SKILL_USED, context, wielder);

    expect(
      spotlessHeartPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0.4 * wielder.attributes.defense);
  });
});
