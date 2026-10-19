import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { createIfaKitBehaviour, IFA_CHARACTER_ID } from "#src/services/kit/characters/ifaKit";
import { IANSAN_CHARACTER_ID } from "#src/services/kit/characters/iansanKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const IFA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IFA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createIfaCombatant = (constellationCount = 0, ascension = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: IFA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: IFA_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// The DMG Bonus Ifa's party reaction hook adds to a reaction of the given type, read with her points in the given context
const partyDamageBonusOf = (combatant: Combatant, reactionType: KitReaction["reactionType"], context: KitContext) =>
  IFA_KIT.getPartyReactionBonus?.(
    combatant,
    { combatant, element: Element.Electro, enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), reactionType },
    context,
  )?.damageBonus ?? 0;

describe(createIfaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...IFA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...IFA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      IFA_KIT.plungeCollision.talentMultiplier,
      takeOne(IFA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(IFA_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.536072, 0.474672, 0.747584, 1.4704, 0.568288, 1.136335, 1.419344]);
  });

  test("the three normal attacks hit at their hitmarks and end at their animation frames", () => {
    expect.hasAssertions();
    expect(
      IFA_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[10], [13], [42]]);
    expect(IFA_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([27, 31, 90]);
  });

  test("the charged attack hits at 45 frames of an 86-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(IFA_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(45);
    expect(Math.round(IFA_KIT.chargedAttack.seconds * 60)).toBe(86);
    expect(IFA_KIT.chargedAttackStamina).toBe(50);
  });

  test("the burst's hit lands at 41 frames and costs 60 energy for 15 seconds, and the skill cools for 7.5 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(IFA_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(41);
    expect(IFA_KIT.burstEnergyCost).toBe(60);
    expect(IFA_KIT.burstCooldownSeconds).toBe(15);
    expect(IFA_KIT.skillCooldownSeconds).toBe(7.5);
  });

  test("the low plunge lands at 38 frames and the collision at 32", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(IFA_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(38);
    expect(Math.round(IFA_KIT.plungeCollision.hitmarkSeconds * 60)).toBe(32);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(IFA_KIT.elementalBurst, createIfaCombatant(4));

    expect(
      kitEffectState.effects.find(
        (effect) => effect.kind === "buff" && effect.attribute === Attribute.ElementalMastery,
      ),
    ).toStrictEqual({
      amount: 100,
      attribute: Attribute.ElementalMastery,
      characterId: IFA_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 15,
    });
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(IFA_KIT.elementalBurst, createIfaCombatant(3));

    expect(
      kitEffectState.effects.find(
        (effect) => effect.kind === "buff" && effect.attribute === Attribute.ElementalMastery,
      ),
    ).toBeUndefined();
  });

  test("the skill's press enters the Nightsoul Blessing with 80 points, which drain eight a second, and a press in it leaves it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIfaCombatant());
    IFA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 5);
    expect(countKitResource(context.kitEffectState.effects, IFA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(40);
    IFA_KIT.elementalSkill.onStart?.(context);
    expect(
      findKitStatus(context.kitEffectState.effects, IFA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
    expect(countKitResource(context.kitEffectState.effects, IFA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });

  test("a passive takes effect at its ascension phase: Ifa's Rescue Essentials add 1.5% a point to the Swirl and Electro-Charged DMG her party deals, and 0.2% to the Lunar-Charged, up to 150 points", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(0, 1);
    const context = createKitTestContext(combatant);
    IFA_KIT.elementalSkill.onStart?.(context);
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBeCloseTo(1.2);
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.ElectroCharged, context)).toBeCloseTo(1.2);
    expect(partyDamageBonusOf(combatant, LunarReactionType.LunarCharged, context)).toBeCloseTo(0.16);
    const cappedContext = createKitTestContext(combatant);
    enterKitNightsoulBlessing(cappedContext.kitEffectState, IFA_CHARACTER_ID, {
      nightsoulRate: { maximum: 200, perSecond: -8 },
      points: 200,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, cappedContext)).toBeCloseTo(2.25);
    expect(partyDamageBonusOf(combatant, LunarReactionType.LunarCharged, cappedContext)).toBeCloseTo(0.3);
  });

  test("does not take effect below its ascension phase: Ifa at A0 adds no DMG Bonus to her party's reactions", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant();
    const context = createKitTestContext(combatant);
    IFA_KIT.elementalSkill.onStart?.(context);
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBe(0);
    expect(partyDamageBonusOf(combatant, LunarReactionType.LunarCharged, context)).toBe(0);
  });

  test("a passive takes effect at its ascension phase: Ifa's Rescue Essentials count the Nightsoul points of her whole party, not her own alone", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(0, 1);
    const context = createKitTestContext(combatant, { party: createParty([IFA_CHARACTER_ID, IANSAN_CHARACTER_ID]) });
    enterKitNightsoulBlessing(context.kitEffectState, IFA_CHARACTER_ID, {
      points: 40,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, {
      points: 40,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBeCloseTo(1.2);
  });

  test("a passive takes effect at its ascension phase: the party's points give Ifa no Rescue Essentials once her own blessing has ended", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(0, 1);
    const context = createKitTestContext(combatant, { party: createParty([IFA_CHARACTER_ID, IANSAN_CHARACTER_ID]) });
    IFA_KIT.elementalSkill.onStart?.(context);
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, {
      points: 80,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    IFA_KIT.elementalSkill.onStart?.(context);
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBe(0);
  });

  test("a passive takes effect at its ascension phase: her Rescue Essentials are cleared with her blessing, so no DMG Bonus remains once it ends", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(0, 1);
    const context = createKitTestContext(combatant);
    IFA_KIT.elementalSkill.onStart?.(context);
    IFA_KIT.elementalSkill.onStart?.(context);
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBe(0);
  });

  test("a passive takes effect at its constellation: Constellation 2 counts the party's points above 60 three times over, so 80 points give Ifa 140 for her Swirl DMG", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(2, 1);
    const context = createKitTestContext(combatant, { party: createParty([IFA_CHARACTER_ID, IANSAN_CHARACTER_ID]) });
    enterKitNightsoulBlessing(context.kitEffectState, IFA_CHARACTER_ID, {
      points: 40,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, {
      points: 40,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBeCloseTo(2.1);
    expect(partyDamageBonusOf(combatant, LunarReactionType.LunarCharged, context)).toBeCloseTo(0.28);
  });

  test("a passive takes effect at its constellation: Constellation 2 lifts the cap to 200 points, so 200 party points give Ifa 3.0 for her Swirl DMG", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(2, 1);
    const context = createKitTestContext(combatant, { party: createParty([IFA_CHARACTER_ID, IANSAN_CHARACTER_ID]) });
    enterKitNightsoulBlessing(context.kitEffectState, IFA_CHARACTER_ID, {
      points: 100,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, {
      points: 100,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBeCloseTo(3);
  });

  test("does not take effect below its constellation: at Constellation 1 the party's points above 60 count once, so 80 points give Ifa 80 for her Swirl DMG", () => {
    expect.hasAssertions();
    const combatant = createIfaCombatant(1, 1);
    const context = createKitTestContext(combatant, { party: createParty([IFA_CHARACTER_ID, IANSAN_CHARACTER_ID]) });
    enterKitNightsoulBlessing(context.kitEffectState, IFA_CHARACTER_ID, {
      points: 40,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, {
      points: 40,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
    expect(partyDamageBonusOf(combatant, TransformativeReactionType.Swirl, context)).toBeCloseTo(1.2);
  });
});
