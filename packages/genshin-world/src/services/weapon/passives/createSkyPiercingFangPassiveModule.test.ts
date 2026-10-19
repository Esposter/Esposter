import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createSkyPiercingFangPassiveModule } from "#src/services/weapon/passives/createSkyPiercingFangPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createSkyPiercingFangPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.BaseAttack, value: 1000 }]);
  // Synthetic params, not the weapon's row: a burst gives Movement SPD of a fifth and Normal Attack SPD of three
  // Tenths, and Normal and Charged hits deal half of ATK more as base damage, for four seconds
  const skyPiercingFangPassiveModule = createSkyPiercingFangPassiveModule([0.1, 0.2, 0.3, 0.5, 4]);
  const BURST_USED = { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed as const };
  const createStrike = (attackTag: AttackTag, combatant: Combatant = wielder): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("a burst raises the wielder's Movement SPD and Normal Attack SPD for four seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyPiercingFangPassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.MovementSpeed, secondsRemaining: 4 },
      { amount: 0.3, attribute: Attribute.NormalAttackSpeed, secondsRemaining: 4 },
    ]);
  });

  test("a normal or charged attack gains the rank's share of ATK as base damage once the burst is used", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyPiercingFangPassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack].map((attackTag) =>
        skyPiercingFangPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createStrike(attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
          context.characterIdCombatantMap,
        ),
      ),
    ).toStrictEqual([0.5 * wielder.attributes.attack, 0.5 * wielder.attributes.attack]);
  });

  test("the share is the striker's ATK, priced with its buffs on", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyPiercingFangPassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    buffKitMember(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: 0.5,
      attribute: Attribute.AttackPercent,
      secondsRemaining: 12,
      source: "test",
    });
    const { attributeTotalMap } = wielder.attributes;
    const buffedAttack =
      attributeTotalMap[Attribute.BaseAttack] * (1 + attributeTotalMap[Attribute.AttackPercent] + 0.5) +
      attributeTotalMap[Attribute.Attack];

    const pricedWielder = getBuffedCombatant(
      wielder,
      context.kitEffectState.effects,
      context.party,
      context.characterIdCombatantMap,
    );

    expect(
      skyPiercingFangPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack, pricedWielder),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBeCloseTo(0.5 * buffedAttack);
  });

  test("an elemental skill's strike gains no base damage, and neither does a normal attack before the burst", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      skyPiercingFangPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
    skyPiercingFangPassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(
      skyPiercingFangPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });

  test("a normal attack gains no base damage after the four seconds run out", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyPiercingFangPassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    stepKitSeconds(context, 4);

    expect(
      skyPiercingFangPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });
});
