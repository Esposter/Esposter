import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createAtTheEndOfTheBeastPathsPassiveModule } from "#src/services/weapon/passives/createAtTheEndOfTheBeastPathsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createAtTheEndOfTheBeastPathsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // At the End of the Beast-Paths with synthetic params: its All Elemental DMG Bonus is a passive bonus. A Charged
  // Attack obtains Tireless Hunt, adding 50% of Elemental Mastery to the Charged Attack DMG it is obtained with, ending
  // After 3 Charged Attacks or 2 seconds, and it is obtained once every 4 seconds
  const atTheEndOfTheBeastPathsPassiveModule = createAtTheEndOfTheBeastPathsPassiveModule([0.2, 0.5, 3, 2, 4]);
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.ElementalMastery, value: 100 }]);
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });
  const createBonus = (context: KitContext, attackTag: AttackTag) =>
    atTheEndOfTheBeastPathsPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
      createKitStrike(wielder, attackTag),
      enemy,
      context.party,
      context.kitEffectState.effects,
      context.characterIdCombatantMap,
    );

  test("a charged attack obtains Tireless Hunt, adding the share of Elemental Mastery to charged attack hits", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect([createBonus(context, AttackTag.ChargedAttack), createBonus(context, AttackTag.NormalAttack)]).toStrictEqual(
      [50, 0],
    );
  });

  test("a normal attack obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(createBonus(context, AttackTag.ChargedAttack)).toBe(0);
  });

  test("the Tireless Hunt ends after its 3 charged attacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const chargedAttackHit = createDamageTaken(AttackTag.ChargedAttack);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    for (let instance = 0; instance < 2; instance++)
      atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    const bonusAfter2Instances = createBonus(context, AttackTag.ChargedAttack);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);

    expect([bonusAfter2Instances, createBonus(context, AttackTag.ChargedAttack)]).toStrictEqual([50, 0]);
  });

  test("the Tireless Hunt ends after two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 2.1);

    expect(createBonus(context, AttackTag.ChargedAttack)).toBe(0);
  });

  test("the wielder obtains Tireless Hunt once every four seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const chargedAttackHit = createDamageTaken(AttackTag.ChargedAttack);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    for (let instance = 0; instance < 3; instance++)
      atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    const bonusInsideCooldown = createBonus(context, AttackTag.ChargedAttack);
    stepKitSeconds(context, 4.1);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);

    expect([bonusInsideCooldown, createBonus(context, AttackTag.ChargedAttack)]).toStrictEqual([0, 50]);
  });

  test("the wielder's Elemental DMG Bonuses rise by 20% each", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      atTheEndOfTheBeastPathsPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.2, attribute })));
  });
});
