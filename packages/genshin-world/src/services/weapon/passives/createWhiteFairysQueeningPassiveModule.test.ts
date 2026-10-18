import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

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
import { createWhiteFairysQueeningPassiveModule } from "#src/services/weapon/passives/createWhiteFairysQueeningPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createWhiteFairysQueeningPassiveModule, () => {
  // White Fairy's Queening at its first rank: its ATK line is passive. Each Charged Attack the wielder lands gives a stack of
  // Transcendence, raising Stellar-Conduct and Stellar Swirl reaction DMG by 16% for five seconds, once every 0.2 seconds and
  // Up to three stacks
  const whiteFairysQueeningPassiveModule = createWhiteFairysQueeningPassiveModule([0.28, 0.16, 5, 0, 0, 0, 0, 0]);
  const otherMemberCharacterId = -1;
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const onField: DeployedCombatant[] = [{ ...wielder, isOnField: true }];
  const createDamageTaken = (attackTag: AttackTag, striker: Combatant = wielder) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker,
  });

  test("the wielder's ATK is raised by 28%", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      whiteFairysQueeningPassiveModule
        .getPassiveBonuses?.(wielder, 1, onField, context.kitEffectState.effects)
        ?.find(({ attribute }) => attribute === Attribute.AttackPercent)?.amount,
    ).toBe(0.28);
  });

  test("a Charged Attack the wielder lands gives a stack of 16% Stellar reaction DMG for five seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.16, attribute: Attribute.StellarGlimmerReactionDamageBonus, secondsRemaining: 5 },
    ]);
  });

  test("a Normal Attack gives no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("a Charged Attack of another member gives no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whiteFairysQueeningPassiveModule.onKitEvent?.(
      createDamageTaken(AttackTag.ChargedAttack, { ...wielder, characterId: otherMemberCharacterId }),
      context,
      wielder,
    );

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("a second Charged Attack within 0.2 seconds of the last gives no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 0.1);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(readBuffs(context.kitEffectState.effects).map(({ amount }) => amount)).toStrictEqual([0.16]);
  });

  test("the stacks stop at three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 0.3);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 0.3);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 0.3);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 3 * 0.16, attribute: Attribute.StellarGlimmerReactionDamageBonus, secondsRemaining: 5 },
    ]);
  });

  test("the stacks end five seconds after they are gained", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    whiteFairysQueeningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    stepKitSeconds(context, 5.1);

    expect(readBuffs(context.kitEffectState.effects).filter(({ amount }) => amount > 0)).toStrictEqual([]);
  });
});
