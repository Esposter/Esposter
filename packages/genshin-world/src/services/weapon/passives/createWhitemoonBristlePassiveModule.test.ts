import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createWhitemoonBristlePassiveModule } from "#src/services/weapon/passives/createWhitemoonBristlePassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createWhitemoonBristlePassiveModule, () => {
  // Whitemoon Bristle at its first rank: its CRIT Rate line is the table's, and Foliar Incision adds 120% of Elemental Mastery
  // To the Normal Attack and Elemental Skill DMG it is obtained with, ending after 28 DMG instances or 12 seconds, once every
  // 12 seconds
  const whitemoonBristlePassiveModule = createWhitemoonBristlePassiveModule([0.04, 1.2, 28, 12, 12]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: 100 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
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
  const createStrike = (attackTag: AttackTag): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("an elemental normal attack obtains Foliar Incision, adding the share of Elemental Mastery to normal and skill hits", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );

    expect(
      [AttackTag.NormalAttack, AttackTag.ElementalSkill].map((attackTag) =>
        whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createStrike(attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
          context.characterIdCombatantMap,
        ),
      ),
    ).toStrictEqual([120, 120]);
  });

  test("a charged attack gains no base damage from Foliar Incision", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );

    expect(
      whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ChargedAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });

  test("a normal attack without an element obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(
      whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });

  test("the Foliar Incision ends after its 28 DMG instances", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const elementalSkillHit = createDamageTaken(AttackTag.ElementalSkill);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );
    for (let instance = 0; instance < 27; instance++)
      whitemoonBristlePassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);
    const createBonus = () =>
      whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      );
    const bonusAfter27Instances = createBonus();
    whitemoonBristlePassiveModule.onKitEvent?.(elementalSkillHit, context, wielder);

    expect([bonusAfter27Instances, createBonus()]).toStrictEqual([120, 0]);
  });

  test("the Foliar Incision ends after twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.NormalAttack, elementalHit),
      context,
      wielder,
    );
    stepKitSeconds(context, 12);

    expect(
      whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });

  test("the wielder obtains Foliar Incision once every twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const elementalNormalAttackHit = createDamageTaken(AttackTag.NormalAttack, elementalHit);
    whitemoonBristlePassiveModule.onKitEvent?.(elementalNormalAttackHit, context, wielder);
    for (let instance = 0; instance < 28; instance++)
      whitemoonBristlePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);
    whitemoonBristlePassiveModule.onKitEvent?.(elementalNormalAttackHit, context, wielder);
    const createBonus = () =>
      whitemoonBristlePassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      );
    const bonusInsideCooldown = createBonus();
    stepKitSeconds(context, 12);
    whitemoonBristlePassiveModule.onKitEvent?.(elementalNormalAttackHit, context, wielder);

    expect([bonusInsideCooldown, createBonus()]).toStrictEqual([0, 120]);
  });
});
