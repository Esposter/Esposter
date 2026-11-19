import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createDryasNocturnePassiveModule } from "#src/services/weapon/passives/createDryasNocturnePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createDryasNocturnePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  // Dryas's Nocturne at its first rank: Max HP 12%, 24% and 40% for one to three Remedy stacks, a stack for twenty-five
  // Seconds from an Elemental Skill or a Bond of Life's increase and for twenty from the wielder's healing, and at three
  // Stacks 28% Elemental Burst CRIT Rate, cancelled four seconds after falling under three
  const passiveModule = createDryasNocturnePassiveModule([0.12, 0.24, 0.4, 25, 25, 20, 0.28, 4]);
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  const healSelf = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: 0.2,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
        sourceCharacterId: TRAVELER_CHARACTER_ID,
      },
      context,
      wielder,
    );
  // The given seconds stepped through the team's effects and then the passive's own clock, as the world steps them
  const stepSeconds = (context: KitContext, seconds: number) => {
    for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
      stepKitSeconds(context, FIXED_STEP_SECONDS);
      passiveModule.onStep?.(context, wielder, FIXED_STEP_SECONDS);
    }
  };

  test("each Remedy stack raises Max HP by the rank's share for one to three stacks, and a fourth is held at three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.12, attribute: Attribute.HealthPercent },
    ]);

    useSkill(context);
    useSkill(context);
    useSkill(context);

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.4, attribute: Attribute.HealthPercent },
    ]);
  });

  test("the wielder's healing adds a stack for twenty seconds, and an Elemental Skill's stack lasts twenty-five", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    healSelf(context);
    useSkill(context);

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.24, attribute: Attribute.HealthPercent },
    ]);

    stepSeconds(context, 21);

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.12, attribute: Attribute.HealthPercent },
    ]);
  });

  test("with three stacks the Elemental Burst's CRIT Rate is raised, and it is cancelled four seconds after falling under three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    useSkill(context);
    healSelf(context);
    stepSeconds(context, FIXED_STEP_SECONDS);
    const burst = createKitStrike(wielder, AttackTag.ElementalBurst);
    const readBurstCriticalRate = () =>
      passiveModule.getStrikeCriticalRateBonus?.(burst, enemy, party, context.kitEffectState.effects);

    expect(readBurstCriticalRate()).toBe(0.28);

    // The heal's stack runs out at twenty seconds, leaving two, and the CRIT Rate holds for four seconds after
    stepSeconds(context, 21);
    expect(readBurstCriticalRate()).toBe(0.28);

    stepSeconds(context, 3.5);
    expect(readBurstCriticalRate()).toBe(0);
  });
});
