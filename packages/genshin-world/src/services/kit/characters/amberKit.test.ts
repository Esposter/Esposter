import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { AMBER_CHARACTER_ID } from "#src/services/kit/characters/amberKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const AMBER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, AMBER_CHARACTER_ID);
const createAmberCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: AMBER_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: AMBER_KIT,
  level: 90,
});

// Fiery Rain's arrows as its burst strikes them from a Amber of the given ascension, each strike with the striker it is priced from
const strikeFieryRain = (ascension: number) => {
  const context = createKitTestContext({ ...createAmberCombatant(), ascension });
  AMBER_KIT.elementalBurst.onStart?.(context);
  return stepKitTestEffects(4, context);
};

const OTHER_CHARACTER_ID = 10_000_999;
// One aimed shot of Amber's, its charged attack's hit striking the given number of opponents
const fireAimedShot = (combatant: Combatant, context: KitContext, opponents: number): void => {
  AMBER_KIT.chargedAttack.onStart?.(context);
  const hit = takeOne(AMBER_KIT.chargedAttack.hits);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  for (let opponent = 0; opponent < opponents; opponent++)
    hit.onStrike?.(context, { body: context.body, combatant, hit }, enemy);
};

describe("amber kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...AMBER_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(AMBER_KIT.chargedAttack.hits).talentMultiplier,
      AMBER_KIT.plungeCollision.talentMultiplier,
      takeOne(AMBER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(AMBER_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.3612, 0.3612, 0.4644, 0.473, 0.5934, 1.24, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant(4);

    expect(AMBER_KIT.getSkillChargeBonus?.(combatant)).toBe(1);
    expect(AMBER_KIT.getSkillCooldownMultiplier?.(createKitTestContext(combatant))).toBe(0.8);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant(3);

    expect(AMBER_KIT.getSkillChargeBonus?.(combatant)).toBe(0);
    expect(AMBER_KIT.getSkillCooldownMultiplier?.(createKitTestContext(combatant))).toBe(1);
  });

  test("its Baron Bunny strikes nothing while it stands, then explodes once when its seconds run out", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createAmberCombatant(), { kitEffectState });
    AMBER_KIT.elementalSkill.onStart?.(context);

    // Landing and the eight seconds after it leave the bunny standing until its timer runs out
    expect(stepKitTestEffects(8, context)).toStrictEqual([]);
    const explosions = stepKitTestEffects(1, context);
    expect(explosions.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([1.232]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("its Fiery Rain lands its eighteen arrows by the last wave, and nothing after", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createAmberCombatant(), { kitEffectState });
    AMBER_KIT.elementalBurst.onStart?.(context);

    const arrows = stepKitTestEffects(4, context);
    expect(arrows).toHaveLength(18);
    expect(arrows.every(({ hit }) => hit.talentMultiplier === 0.2808)).toBe(true);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("the Ascension 1 passive, Every Arrow Finds Its Target, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const baseCriticalRate = createAmberCombatant().attributes.attributeTotalMap[Attribute.CriticalRate];
    const baseArrows = strikeFieryRain(0);
    const arrows = strikeFieryRain(1);

    expect(arrows.map(({ hit }) => hit.hitArea.radius)).toStrictEqual(
      baseArrows.map(({ hit }) => hit.hitArea.radius * 1.3),
    );
    expect(
      arrows.every(
        ({ combatant }) => combatant.attributes.attributeTotalMap[Attribute.CriticalRate] === baseCriticalRate + 0.1,
      ),
    ).toBe(true);
  });

  test("the Ascension 1 passive, Every Arrow Finds Its Target, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const baseCriticalRate = createAmberCombatant().attributes.attributeTotalMap[Attribute.CriticalRate];
    const arrows = strikeFieryRain(0);

    expect(arrows).toHaveLength(18);
    expect(
      arrows.every(
        ({ combatant }) => combatant.attributes.attributeTotalMap[Attribute.CriticalRate] === baseCriticalRate,
      ),
    ).toBe(true);
  });

  test("constellation 1 fires a second arrow of 20% of the first arrow's DMG with each aimed shot", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant(1);
    const context = createKitTestContext(combatant);

    fireAimedShot(combatant, context, 1);

    expect(context.strikes).toHaveLength(1);
    expect(takeOne(context.strikes).hit.talentMultiplier).toBeCloseTo(
      0.2 * takeOne(AMBER_KIT.chargedAttack.hits).talentMultiplier,
    );
  });

  test("constellation 1 fires one second arrow per aimed shot, however many opponents the first arrow strikes", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant(1);
    const context = createKitTestContext(combatant);

    fireAimedShot(combatant, context, 3);

    expect(context.strikes).toHaveLength(1);
  });

  test("constellation 0 fires no second arrow", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant(0);
    const context = createKitTestContext(combatant);

    fireAimedShot(combatant, context, 2);

    expect(context.strikes).toStrictEqual([]);
  });

  test("constellation 6 raises each party member's Movement SPD and ATK by 15% for 10 seconds with Fiery Rain", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createAmberCombatant(6), {
      party: createParty([AMBER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });

    AMBER_KIT.elementalBurst.onStart?.(context);

    const buffs = context.kitEffectState.effects.filter((effect): effect is KitBuff => effect.kind === "buff");
    expect(
      buffs.map(({ amount, attribute, characterId, secondsRemaining }) => [
        characterId,
        attribute,
        amount,
        secondsRemaining,
      ]),
    ).toStrictEqual([
      [AMBER_CHARACTER_ID, Attribute.MovementSpeed, 0.15, 10],
      [OTHER_CHARACTER_ID, Attribute.MovementSpeed, 0.15, 10],
      [AMBER_CHARACTER_ID, Attribute.AttackPercent, 0.15, 10],
      [OTHER_CHARACTER_ID, Attribute.AttackPercent, 0.15, 10],
    ]);
  });

  test("constellation 5 gives no party member Fiery Rain's Movement SPD and ATK", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createAmberCombatant(5), { party: createParty([AMBER_CHARACTER_ID]) });

    AMBER_KIT.elementalBurst.onStart?.(context);

    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });
});
