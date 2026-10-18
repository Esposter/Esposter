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
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createSkywardBladePassiveModule } from "#src/services/weapon/passives/createSkywardBladePassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 1000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Sky-Piercing Fang at its first rank: a burst gives Movement SPD and Normal Attack SPD of ten per cent each, and Normal and
// Charged hits deal twenty per cent of ATK more for twelve seconds
const skywardBladePassiveModule = createSkywardBladePassiveModule([0.04, 0.1, 0.1, 0.2, 12]);
const BURST_USED = { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed as const };
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});

describe(createSkywardBladePassiveModule, () => {
  test("a burst raises the wielder's Movement SPD and Normal Attack SPD for twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skywardBladePassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.MovementSpeed, secondsRemaining: 12 },
      { amount: 0.1, attribute: Attribute.NormalAttackSpeed, secondsRemaining: 12 },
    ]);
  });

  test("a normal or charged attack gains the rank's share of ATK as base damage once the burst is used", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skywardBladePassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack].map((attackTag) =>
        skywardBladePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createStrike(attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
        ),
      ),
    ).toStrictEqual([0.2 * wielder.attributes.attack, 0.2 * wielder.attributes.attack]);
  });

  test("an elemental skill's strike gains no base damage, and neither does a normal attack before the burst", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      skywardBladePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
    skywardBladePassiveModule.onKitEvent?.(BURST_USED, context, wielder);

    expect(
      skywardBladePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("a normal attack gains no base damage after the twelve seconds run out", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skywardBladePassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    stepKitSeconds(context, 12);

    expect(
      skywardBladePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });
});
