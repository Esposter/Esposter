import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createAtTheEndOfTheBeastPathsPassiveModule } from "#src/services/weapon/passives/createAtTheEndOfTheBeastPathsPassiveModule";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createAtTheEndOfTheBeastPathsPassiveModule, () => {
  // At the End of the Beast-Paths at its first rank: its All Elemental DMG Bonus is a passive bonus. A Charged Attack obtains
  // Tireless Hunt, adding 160% of Elemental Mastery to the Charged Attack DMG it is obtained with, ending after 12 Charged
  // Attacks or 10 seconds, and it is obtained once every 12 seconds
  const atTheEndOfTheBeastPathsPassiveModule = createAtTheEndOfTheBeastPathsPassiveModule([0.12, 1.6, 12, 10, 12]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: 100 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
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
  const createBonus = (context: KitContext, attackTag: AttackTag) =>
    atTheEndOfTheBeastPathsPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
      createStrike(attackTag),
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
      [160, 0],
    );
  });

  test("a normal attack obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(createBonus(context, AttackTag.ChargedAttack)).toBe(0);
  });

  test("the Tireless Hunt ends after its 12 charged attacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const chargedAttackHit = createDamageTaken(AttackTag.ChargedAttack);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    for (let instance = 0; instance < 11; instance++)
      atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    const bonusAfter11Instances = createBonus(context, AttackTag.ChargedAttack);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);

    expect([bonusAfter11Instances, createBonus(context, AttackTag.ChargedAttack)]).toStrictEqual([160, 0]);
  });

  test("the Tireless Hunt ends after ten seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 10.1);

    expect(createBonus(context, AttackTag.ChargedAttack)).toBe(0);
  });

  test("the wielder obtains Tireless Hunt once every twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const chargedAttackHit = createDamageTaken(AttackTag.ChargedAttack);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    for (let instance = 0; instance < 12; instance++)
      atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);
    const bonusInsideCooldown = createBonus(context, AttackTag.ChargedAttack);
    stepKitSeconds(context, 12.1);
    atTheEndOfTheBeastPathsPassiveModule.onKitEvent?.(chargedAttackHit, context, wielder);

    expect([bonusInsideCooldown, createBonus(context, AttackTag.ChargedAttack)]).toStrictEqual([0, 160]);
  });

  test("the wielder's Elemental DMG Bonuses rise by 12% each", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      atTheEndOfTheBeastPathsPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute })));
  });
});
