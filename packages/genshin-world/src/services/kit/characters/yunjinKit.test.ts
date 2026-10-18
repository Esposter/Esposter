import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createYunjinKitBehaviour, YUNJIN_CHARACTER_ID } from "#src/services/kit/characters/yunjinKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YUNJIN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YUNJIN_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createYunjinCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.BaseDefense, value: 800 },
  ]),
  characterId: YUNJIN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: YUNJIN_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

const castStart = (action: KitAction, combatant = createYunjinCombatant()): KitEffectState => {
  const context = createKitTestContext(combatant);
  action.onStart?.(context);
  return context.kitEffectState;
};

// The buffs Yun Jin's own reactions give her, at a constellation count, as her kit reads them
const readReactionBuffs = (constellationCount: number, reactions: Reaction[]) => {
  const combatant = { ...createYunjinCombatant(), constellationCount };
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  YUNJIN_KIT.onKitEvent?.(
    {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.ReactionTriggered,
      reactions,
      striker: combatant,
    },
    context,
    combatant,
  );

  return kitEffectState.effects.flatMap((effect) =>
    effect.kind === "buff" ? [[effect.attribute, effect.amount, effect.secondsRemaining]] : [],
  );
};

describe(createYunjinKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...YUNJIN_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(YUNJIN_KIT.chargedAttack.hits).talentMultiplier,
      YUNJIN_KIT.plungeCollision.talentMultiplier,
      takeOne(YUNJIN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(YUNJIN_KIT.highPlunge.hits).talentMultiplier,
      takeOne(YUNJIN_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.40506, 0.40248, 0.22962, 0.2752, 0.23994, 0.2881, 0.67338, 1.2169, 0.639324, 1.278377, 1.596762, 2.44,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("opening Flourish's tap and charges scale with her DEF, not her ATK", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const tap = takeOne(YUNJIN_KIT.elementalSkill.hits);
    const [level1, level2] = YUNJIN_KIT.elementalSkillHolds ?? [];

    expect(tap.talentMultiplier).toBe(0);
    expect(tap.additiveBaseDamageBonus?.(combatant)).toBeCloseTo(1.4912 * combatant.attributes.defense);
    expect(takeOne(level1?.action.hits ?? []).additiveBaseDamageBonus?.(combatant)).toBeCloseTo(
      2.6096 * combatant.attributes.defense,
    );
    expect(takeOne(level2?.action.hits ?? []).additiveBaseDamageBonus?.(combatant)).toBeCloseTo(
      3.728 * combatant.attributes.defense,
    );
  });

  test("the skill's hitmarks and hold thresholds, and the cooldowns and costs her table gives", () => {
    expect.hasAssertions();
    const [level1, level2] = YUNJIN_KIT.elementalSkillHolds ?? [];

    expect(Math.round(takeOne(YUNJIN_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(13);
    expect(Math.round(takeOne(level1?.action.hits ?? []).hitmarkSeconds * 60)).toBe(50);
    expect(Math.round(takeOne(level2?.action.hits ?? []).hitmarkSeconds * 60)).toBe(93);
    expect([level1?.minimumHeldSeconds, level2?.minimumHeldSeconds]).toStrictEqual([0.5, 1]);
    expect([YUNJIN_KIT.skillCooldownSeconds, level1?.cooldownSeconds, level2?.cooldownSeconds]).toStrictEqual([
      9, 9, 9,
    ]);
    expect([
      YUNJIN_KIT.chargedAttackStamina,
      YUNJIN_KIT.burstEnergyCost,
      YUNJIN_KIT.burstCooldownSeconds,
    ]).toStrictEqual([25, 60, 15]);
  });

  test("opening Flourish's shield is her Max HP's share and flat HP, lasting until its hit", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const [shield] = castStart(YUNJIN_KIT.elementalSkill, combatant).effects as KitShield[];

    expect(shield?.kind).toBe("shield");
    expect(shield?.element).toBe(Element.Geo);
    expect(shield?.health).toBeCloseTo(0.12 * combatant.attributes.maxHealth + 1155.4323);
    expect(shield?.secondsRemaining).toBeCloseTo(13 / 60);
  });

  test("the burst's initial hit is a circle of 6 metres round the body, with its 200 poise", () => {
    expect.hasAssertions();
    const hit: KitHit = takeOne(YUNJIN_KIT.elementalBurst.hits);

    expect(hit.hitArea.radius).toBe(6);
    expect(hit.poiseDamage).toBe(200);
    expect(Math.round(hit.hitmarkSeconds * 60)).toBe(35);
  });

  test("a Constellation 4 Crystallize of hers gives her 20% DEF for 12 seconds", () => {
    expect.hasAssertions();

    expect(readReactionBuffs(4, [{ element: Element.Geo, reactionType: ReactionType.Crystallize }])).toStrictEqual([
      [Attribute.DefensePercent, 0.2, 12],
    ]);
  });

  test("a Constellation 3 switch, or a reaction that is not Crystallize, gives no DEF", () => {
    expect.hasAssertions();

    expect([
      readReactionBuffs(3, [{ element: Element.Geo, reactionType: ReactionType.Crystallize }]),
      readReactionBuffs(4, [{ element: Element.Electro, reactionType: ReactionType.Superconduct }]),
    ]).toStrictEqual([[], []]);
  });
});
