import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createDayAndNightInCounterpointPassiveModule } from "#src/services/weapon/passives/createDayAndNightInCounterpointPassiveModule";
import { createReaction } from "#src/services/weapon/passives/createReaction.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createDayAndNightInCounterpointPassiveModule, () => {
  const wielder = createWielderCombatant();
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // Forged by the Golden Melody at its first rank: 18% ATK, 120 Elemental Mastery and 28% Stellar Glimmer DMG, each a
  // Harmonic Movement of ten seconds every ten seconds, and a Contrapuntal of twelve seconds once every twelve
  const passiveModule = createDayAndNightInCounterpointPassiveModule([0.18, 120, 0.28, 10, 12, 12]);

  test("the clock's first play is the rank's ATK for its ten seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onStep?.(context, wielder, 0.1);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.AttackPercent, 0.18, 10]]);
  });

  test("the next play, ten seconds on, is the rank's Elemental Mastery, and the clock holds it back before then", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onStep?.(context, wielder, 0.1);
    stepKitSeconds(context, 5);
    passiveModule.onStep?.(context, wielder, 0.1);

    expect(
      readBuffTuples(context.kitEffectState.effects).map(([attribute, amount]) => [attribute, amount]),
    ).toStrictEqual([[Attribute.AttackPercent, 0.18]]);

    stepKitSeconds(context, 5);
    passiveModule.onStep?.(context, wielder, 0.1);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.ElementalMastery, 120, 10]]);
  });

  test("the third play is the rank's Stellar Glimmer DMG", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let play = 0; play < 2; play++) {
      passiveModule.onStep?.(context, wielder, 0.1);
      stepKitSeconds(context, 10);
    }
    passiveModule.onStep?.(context, wielder, 0.1);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.StellarGlimmerReactionDamageBonus, 0.28, 10],
    ]);
  });

  test("a Stellar Glimmer reaction the wielder triggers copies the live movement for twelve seconds, once every twelve", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onStep?.(context, wielder, 0.1);
    const stellarReaction = createReaction(wielder, enemy, StellarReactionType.StellarSwirl, Element.Cryo);
    passiveModule.onKitEvent?.(stellarReaction, context, wielder);
    passiveModule.onKitEvent?.(stellarReaction, context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.AttackPercent, 0.18, 10],
      [Attribute.AttackPercent, 0.18, 12],
    ]);
  });
});
