import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createWhitemoonBristlePassiveModule } from "#src/services/weapon/passives/createWhitemoonBristlePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createWhitemoonBristlePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Synthetic params, not the weapon's row: a tenth for an unread CRIT Rate line, and half of Elemental Mastery as
  // Foliar Incision's base damage to the Normal Attack and Elemental Skill DMG it is obtained with, ending after 3 DMG
  // Instances or 2 seconds, once every 2 seconds
  const whitemoonBristlePassiveModule = createWhitemoonBristlePassiveModule([0.1, 0.5, 3, 2, 2]);
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.ElementalMastery, value: 100 }]);
  const elementalHit = { ...TRAVELER_KIT.plungeCollision, element: Element.Pyro };
  const createDamageTaken = (attackTag: AttackTag, hit = TRAVELER_KIT.plungeCollision) => ({
    attackTag,
    enemy,
    hit,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });
  // The base damage Foliar Incision adds to a strike of the attack tag, read through the kit's context
  const readBaseDamageBonus = (context: KitContext, attackTag: AttackTag) =>
    whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
      createKitStrike(wielder, attackTag),
      enemy,
      context.party,
      context.kitEffectState.effects,
      context.characterIdCombatantMap,
    );

  test("an elemental normal attack obtains Foliar Incision, adding the share of Elemental Mastery to normal and skill hits", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );

    expect(
      [AttackTag.NormalAttack, AttackTag.ElementalSkill].map((attackTag) => readBaseDamageBonus(context, attackTag)),
    ).toStrictEqual([50, 50]);
  });

  test("a charged attack gains no base damage from Foliar Incision", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );

    expect(readBaseDamageBonus(context, AttackTag.ChargedAttack)).toBe(0);
  });

  test("a normal attack without an element obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(readBaseDamageBonus(context, AttackTag.NormalAttack)).toBe(0);
  });

  test("the Foliar Incision ends after its 3 DMG instances", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const elementalSkillHit = createDamageTaken(AttackTag.ElementalSkill);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );
    for (let instance = 0; instance < 2; instance++)
      whitemoonBristlePassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    const createBonus = () => readBaseDamageBonus(context, AttackTag.ElementalSkill);
    const bonusBeforeLastInstance = createBonus();
    whitemoonBristlePassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect([bonusBeforeLastInstance, createBonus()]).toStrictEqual([50, 0]);
  });

  test("the Foliar Incision ends after two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );
    stepKitSeconds(context, 2.1);

    expect(readBaseDamageBonus(context, AttackTag.NormalAttack)).toBe(0);
  });

  test("the wielder obtains Foliar Incision once every two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const elementalNormalAttackHit = createDamageTaken(AttackTag.NormalAttack, elementalHit);
    whitemoonBristlePassiveModule.onKitEvent?.(elementalNormalAttackHit, context, wielder);
    for (let instance = 0; instance < 3; instance++)
      whitemoonBristlePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(elementalNormalAttackHit, context, wielder);
    const createBonus = () => readBaseDamageBonus(context, AttackTag.NormalAttack);
    const bonusInsideCooldown = createBonus();
    stepKitSeconds(context, 2.1);
    whitemoonBristlePassiveModule.onKitEvent?.(elementalNormalAttackHit, context, wielder);

    expect([bonusInsideCooldown, createBonus()]).toStrictEqual([0, 50]);
  });
});
