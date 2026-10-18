import type { Combatant } from "#src/models/kit/Combatant";

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
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createGoldenMajestyPassiveModule } from "#src/services/weapon/passives/createGoldenMajestyPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createGoldenMajestyPassiveModule, () => {
  // Golden Majesty at its first rank: 20% Shield Strength, 4% ATK for each stack of up to five for eight seconds, which a
  // Hit every 0.3 seconds adds, doubled while the wielder on the field is protected by a shield
  const goldenMajestyPassiveModule = createGoldenMajestyPassiveModule([0.2, 0.04, 8]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const deployedOnField = [{ ...wielder, isOnField: true }];
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("the wielder's Shield Strength is raised by the rank's percentage", () => {
    expect.hasAssertions();

    expect(goldenMajestyPassiveModule.getPassiveBonuses?.(wielder, 1, deployedOnField, [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0, attribute: Attribute.AttackPercent },
    ]);
  });

  test("a hit the wielder scores gains a stack of ATK for eight seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    goldenMajestyPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(
      goldenMajestyPassiveModule.getPassiveBonuses?.(wielder, 1, deployedOnField, context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0.04, attribute: Attribute.AttackPercent },
    ]);

    stepKitSeconds(context, 8.1);

    expect(
      goldenMajestyPassiveModule.getPassiveBonuses?.(wielder, 1, deployedOnField, context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0, attribute: Attribute.AttackPercent },
    ]);
  });

  test("a second hit inside the cooldown gains no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    goldenMajestyPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    goldenMajestyPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(
      goldenMajestyPassiveModule.getPassiveBonuses?.(wielder, 1, deployedOnField, context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0.04, attribute: Attribute.AttackPercent },
    ]);
  });

  test("the stacks stop at five", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (const attackTag of [
      AttackTag.NormalAttack,
      AttackTag.ChargedAttack,
      AttackTag.ElementalSkill,
      AttackTag.ElementalBurst,
      AttackTag.NormalAttack,
      AttackTag.ChargedAttack,
    ]) {
      goldenMajestyPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);
      stepKitSeconds(context, 0.4);
    }

    expect(
      goldenMajestyPassiveModule.getPassiveBonuses?.(wielder, 1, deployedOnField, context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0.04 * 5, attribute: Attribute.AttackPercent },
    ]);
  });

  test("with the wielder on the field and protected by a shield, the stacks' ATK is doubled", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID]) });
    goldenMajestyPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    castKitShield(context.kitEffectState, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });

    expect(
      goldenMajestyPassiveModule.getPassiveBonuses?.(wielder, 1, deployedOnField, context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0.04 * 2, attribute: Attribute.AttackPercent },
    ]);
  });

  test("a shield does not double the stacks' ATK while the wielder is off the field", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID]) });
    goldenMajestyPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    castKitShield(context.kitEffectState, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });

    expect(
      goldenMajestyPassiveModule.getPassiveBonuses?.(
        wielder,
        1,
        [{ ...wielder, isOnField: false }],
        context.kitEffectState.effects,
      ),
    ).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ShieldStrength },
      { amount: 0.04, attribute: Attribute.AttackPercent },
    ]);
  });
});
