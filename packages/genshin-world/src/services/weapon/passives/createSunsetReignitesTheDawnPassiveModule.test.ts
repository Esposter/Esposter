import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { createParty } from "#src/services/party/createParty";
import { createSunsetReignitesTheDawnPassiveModule } from "#src/services/weapon/passives/createSunsetReignitesTheDawnPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enterBlessing = (context: KitContext) => {
  enterKitNightsoulBlessing(context.kitEffectState, TRAVELER_CHARACTER_ID, { points: 0, secondsRemaining: 100 });
};

describe(createSunsetReignitesTheDawnPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();

  const createContext = (): KitContext =>
    createKitTestContext(wielder, { party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]) });

  // Sunset Reignites the Dawn at its first rank: a skill or burst gives Scorching Brilliance, 20% CRIT DMG and 28% ATK
  // For six seconds, once every ten; an elemental normal or charged attack hit extends it by two seconds, once a second,
  // Three times at most; and in Nightsoul's Blessing its effects rise by 75%
  const passiveModule = createSunsetReignitesTheDawnPassiveModule([0.2, 0.28, 0.75, 6, 10, 2, 1, 3]);
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  const useBurst = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );
  const hitWith = (context: KitContext, attackTag: AttackTag, element: Element | undefined) =>
    passiveModule.onKitEvent?.(
      { attackTag, element, enemy, kind: KitEventKind.EnemyHit, striker: wielder },
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
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects) ?? [];
  const checkIsBrilliant = (context: KitContext) => readBonuses(context).length > 0;

  test("a skill or burst gives Scorching Brilliance, 20% CRIT DMG and 28% ATK for six seconds", () => {
    expect.hasAssertions();

    const skillContext = createContext();
    const burstContext = createContext();
    useSkill(skillContext);
    useBurst(burstContext);
    const bonuses = [readBonuses(skillContext), readBonuses(burstContext)];
    stepSeconds(skillContext, 6);

    expect(bonuses).toStrictEqual([
      [
        { amount: 0.2, attribute: Attribute.CriticalDamage },
        { amount: 0.28, attribute: Attribute.AttackPercent },
      ],
      [
        { amount: 0.2, attribute: Attribute.CriticalDamage },
        { amount: 0.28, attribute: Attribute.AttackPercent },
      ],
    ]);
    expect(checkIsBrilliant(skillContext)).toBe(false);
  });

  test("a skill inside the ten-second cooldown gives nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    stepSeconds(context, 7);
    useSkill(context);
    const isBrilliantInsideCooldown = checkIsBrilliant(context);
    stepSeconds(context, 3);
    useSkill(context);

    expect(isBrilliantInsideCooldown).toBe(false);
    expect(checkIsBrilliant(context)).toBe(true);
  });

  test("in Nightsoul's Blessing, Scorching Brilliance's effects rise by 75%", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    enterBlessing(context);
    const [criticalDamage, attackPercent] = readBonuses(context);

    expect(criticalDamage?.amount).toBeCloseTo(0.35);
    expect(attackPercent?.amount).toBeCloseTo(0.49);
  });

  test.each([
    ["normal", AttackTag.NormalAttack],
    ["charged", AttackTag.ChargedAttack],
  ])("an elemental %s attack hit extends it by two seconds", (_title, attackTag) => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    hitWith(context, attackTag, Element.Pyro);
    stepSeconds(context, 7.9);

    expect(checkIsBrilliant(context)).toBe(true);

    stepSeconds(context, 0.1);

    expect(checkIsBrilliant(context)).toBe(false);
  });

  test.each([
    ["a physical normal attack hit", AttackTag.NormalAttack, undefined],
    ["an elemental skill hit", AttackTag.ElementalSkill, Element.Pyro],
  ])("%s does not extend it", (_title, attackTag, element) => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    hitWith(context, attackTag, element);
    stepSeconds(context, 6);

    expect(checkIsBrilliant(context)).toBe(false);
  });

  test("a second hit inside a second of an extension does not extend it", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    hitWith(context, AttackTag.NormalAttack, Element.Pyro);
    hitWith(context, AttackTag.NormalAttack, Element.Pyro);
    stepSeconds(context, 1);
    hitWith(context, AttackTag.NormalAttack, Element.Pyro);
    stepSeconds(context, 8.9);

    expect(checkIsBrilliant(context)).toBe(true);

    stepSeconds(context, 0.1);

    expect(checkIsBrilliant(context)).toBe(false);
  });

  test("its extensions add six seconds at most", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    for (let hitIndex = 0; hitIndex < 4; hitIndex++) {
      hitWith(context, AttackTag.NormalAttack, Element.Pyro);
      stepSeconds(context, 1);
    }
    stepSeconds(context, 7.9);

    expect(checkIsBrilliant(context)).toBe(true);

    stepSeconds(context, 0.1);

    expect(checkIsBrilliant(context)).toBe(false);
  });

  test("off the field in Nightsoul's Blessing its duration does not count down, and off it without one it does", () => {
    expect.hasAssertions();

    const blessedContext = createContext();
    const context = createContext();
    for (const each of [blessedContext, context]) {
      useSkill(each);
      each.party.activeIndex = 1;
    }
    enterBlessing(blessedContext);
    stepSeconds(blessedContext, 20);
    stepSeconds(context, 6);

    expect(checkIsBrilliant(blessedContext)).toBe(true);
    expect(checkIsBrilliant(context)).toBe(false);
  });
});
