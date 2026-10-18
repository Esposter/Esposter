import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { getBenedictionBaseDamageBonus } from "#src/services/kit/characters/columbinaBenediction";
import { COLUMBINA_CHARACTER_ID, createColumbinaKitBehaviour } from "#src/services/kit/characters/columbinaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const COLUMBINA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, COLUMBINA_CHARACTER_ID);
const createColumbinaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: COLUMBINA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: COLUMBINA_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

const OTHER_CHARACTER_ID = 10_000_052;
const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
const c6Enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
// Columbina and another member at the given constellation, with her burst's window just started
const createBurstContext = (constellationCount: number) => {
  const columbina = { ...createColumbinaCombatant(), constellationCount };
  const other = { ...createColumbinaCombatant(), characterId: OTHER_CHARACTER_ID };
  const context = createKitTestContext(columbina, {
    characterIdCombatantMap: new Map([
      [COLUMBINA_CHARACTER_ID, columbina],
      [OTHER_CHARACTER_ID, other],
    ]),
    kitEffectState: { effects: [] },
    party: createParty([COLUMBINA_CHARACTER_ID, OTHER_CHARACTER_ID]),
  });
  COLUMBINA_KIT.elementalBurst.onStart?.(context);
  return { columbina, context, other };
};
// A Lunar reaction the striker triggers on the enemy, which the kit reads as an event
const triggerLunarReaction = (
  context: KitContext,
  columbina: Combatant,
  striker: Combatant,
  reactionType: ReactionType,
): void =>
  COLUMBINA_KIT.onKitEvent?.(
    { enemy: c6Enemy, kind: KitEventKind.ReactionTriggered, reactions: [{ reactionType }], striker },
    context,
    columbina,
  );
// The CRIT DMG a hit of the given element adds to a striker's strike, as Columbina's hook gives it to a party member
const readPartyCriticalDamage = (
  context: KitContext,
  columbina: Combatant,
  striker: Combatant,
  element: Element,
): number =>
  COLUMBINA_KIT.getPartyStrikeBonus?.(
    columbina,
    { body: kitBody, combatant: striker, hit: { ...takeOne(COLUMBINA_KIT.elementalBurst.hits), element } },
    c6Enemy,
    context.party,
    context.kitEffectState.effects,
  )?.criticalDamageBonus ?? 0;
// The CRIT DMG a hit of the given element adds to Columbina's own strike, as her own hook gives it
const readOwnCriticalDamage = (context: KitContext, columbina: Combatant, element: Element): number =>
  COLUMBINA_KIT.getStrikeCriticalDamageBonus?.(
    { body: kitBody, combatant: columbina, hit: { ...takeOne(COLUMBINA_KIT.elementalBurst.hits), element } },
    c6Enemy,
    context.party,
    context.kitEffectState.effects,
  ) ?? 0;

describe(createColumbinaKitBehaviour, () => {
  const combatant = createColumbinaCombatant();
  // The effects a skill's press adds, as the kit's effects hold them
  const startEffects = (kitEffectState: KitEffectState): void =>
    COLUMBINA_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  // Two other members whose kits hold a Moonsign Benediction, declared here, to make a team at Ascendant Gleam with her
  const MOONSIGN_KIT: Kit = { ...COLUMBINA_KIT, moonsignBenediction: { lunarReactionTypes: [] } };
  const MOONSIGN_CHARACTER_IDS = [1, 2];
  // The reach of the hit a DoT tick summons, read with the team the characters make
  const getTickRadius = (characterIds: number[]): number | undefined => {
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    const characterIdCombatantMap = new Map(
      characterIds.map((characterId): [number, Combatant] => [
        characterId,
        { ...combatant, characterId, kit: characterId === COLUMBINA_CHARACTER_ID ? COLUMBINA_KIT : MOONSIGN_KIT },
      ]),
    );
    field?.onTick(
      createKitTestContext(combatant, { characterIdCombatantMap, kitEffectState, party: createParty(characterIds) }),
      0,
    );
    const summon = kitEffectState.effects.find((effect: KitEffect): effect is KitSummon => effect.kind === "summon");
    return summon?.hits[0]?.hitArea.radius;
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...COLUMBINA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(COLUMBINA_KIT.chargedAttack.hits).talentMultiplier,
      COLUMBINA_KIT.plungeCollision.talentMultiplier,
      takeOne(COLUMBINA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(COLUMBINA_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.46792, 0.366256, 0.58484, 1.1608, 0.568288, 1.136335, 1.419344]);
  });

  test("her skill and burst deal their multiplier on max HP, as gcsim's UseHP gives them", () => {
    expect.hasAssertions();
    const shares = [
      takeOne(COLUMBINA_KIT.elementalSkill.hits).additiveBaseDamageBonus,
      takeOne(COLUMBINA_KIT.elementalBurst.hits).additiveBaseDamageBonus,
    ].map((bonus) => bonus?.(combatant));
    expect(shares[0]).toBeCloseTo(0.1672 * 10_000);
    expect(shares[1]).toBeCloseTo(0.3224 * 10_000);
    expect(COLUMBINA_KIT.elementalSkill.hits.map(({ talentMultiplier }) => talentMultiplier)).toStrictEqual([0]);
  });

  test("the cooldowns, energy cost and charged stamina are read from the table", () => {
    expect.hasAssertions();
    expect([
      COLUMBINA_KIT.skillCooldownSeconds,
      COLUMBINA_KIT.burstCooldownSeconds,
      COLUMBINA_KIT.burstEnergyCost,
      COLUMBINA_KIT.chargedAttackStamina,
    ]).toStrictEqual([17, 15, 60, 50]);
  });

  test("a press of her skill sets its DoT field going for the table's duration, from the hit", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    expect(field?.kind).toBe("field");
    expect(Math.round((field?.secondsRemaining ?? 0) * 60)).toBe(25 * 60 + 21);
    expect(Math.round((field?.nextTickSeconds ?? 0) * 60)).toBe(138);
  });

  test("a press while the DoT runs restarts its duration rather than stacking a second field", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    if (field) field.secondsRemaining = 3;
    startEffects(kitEffectState);
    expect(kitEffectState.effects).toHaveLength(1);
    expect(Math.round((field?.secondsRemaining ?? 0) * 60)).toBe(25 * 60 + 21);
  });

  test("each DoT tick summons its hit at the field's centre, priced by her", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startEffects(kitEffectState);
    const [field] = kitEffectState.effects as KitField[];
    field?.onTick(createKitTestContext(combatant, { kitEffectState }), 0);
    const summons = kitEffectState.effects.filter((effect: KitEffect): effect is KitSummon => effect.kind === "summon");
    expect(summons).toHaveLength(1);
    expect(summons[0]?.combatant).toBe(combatant);
    expect(summons[0]?.hits.map(({ hitmarkSeconds }) => hitmarkSeconds)).toStrictEqual([0]);
  });

  test("a DoT tick reaches four from the field's centre while her team is short of Ascendant Gleam", () => {
    expect.hasAssertions();
    expect(getTickRadius([COLUMBINA_CHARACTER_ID])).toBe(4);
  });

  test("a DoT tick reaches six from the field's centre at Ascendant Gleam, with two other Moonsign characters", () => {
    expect.hasAssertions();
    expect(getTickRadius([COLUMBINA_CHARACTER_ID, ...MOONSIGN_CHARACTER_IDS])).toBe(6);
  });

  test("her Benediction's Base DMG bonus is the curve of her max HP", () => {
    expect.hasAssertions();
    expect(COLUMBINA_KIT.moonsignBenediction?.getBaseDamageBonus?.(combatant)).toBeCloseTo(
      getBenedictionBaseDamageBonus(combatant.attributes.maxHealth),
    );
  });

  describe("ascension 1's Lunacy", () => {
    const strikeBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const strikeEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    // The CRIT Rate her charged attack gains after the given Gravity Interference ticks, at the given ascension
    const getCriticalRateBonus = (ascension: number, ticks: number): number => {
      const ascendedCombatant: Combatant = { ...combatant, ascension };
      const kitEffectState: KitEffectState = { effects: [] };
      COLUMBINA_KIT.elementalSkill.onStart?.(createKitTestContext(ascendedCombatant, { kitEffectState }));
      const [field] = kitEffectState.effects as KitField[];
      for (let tick = 0; tick < ticks; tick++)
        field?.onTick(createKitTestContext(ascendedCombatant, { kitEffectState }), 0);
      return (
        COLUMBINA_KIT.getStrikeCriticalRateBonus?.(
          { body: strikeBody, combatant: ascendedCombatant, hit: takeOne(COLUMBINA_KIT.chargedAttack.hits) },
          strikeEnemy,
          createParty([COLUMBINA_CHARACTER_ID]),
          kitEffectState.effects,
        ) ?? 0
      );
    };

    test("a passive takes effect at its ascension phase", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(1, 1)).toBeCloseTo(0.05);
    });

    test("a passive does not take effect below its ascension phase", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(0, 3)).toBe(0);
    });

    test("each Gravity Interference tick stacks Lunacy up to three", () => {
      expect.hasAssertions();

      expect(getCriticalRateBonus(1, 2)).toBeCloseTo(0.1);
      expect(getCriticalRateBonus(1, 5)).toBeCloseTo(0.15);
    });
  });

  test("constellation 6 gives each party member's Electro and Hydro strikes 80% CRIT DMG for eight seconds after a Lunar-Charged reaction in the burst's 1.2 seconds", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(6);
    triggerLunarReaction(context, columbina, other, LunarReactionType.LunarCharged);
    const afterHit = {
      electro: readPartyCriticalDamage(context, columbina, other, Element.Electro),
      geo: readPartyCriticalDamage(context, columbina, other, Element.Geo),
      hydro: readPartyCriticalDamage(context, columbina, other, Element.Hydro),
    };
    stepKitTestEffects(8, context);

    expect({
      afterExpiry: readPartyCriticalDamage(context, columbina, other, Element.Electro),
      afterHit,
    }).toStrictEqual({ afterExpiry: 0, afterHit: { electro: 0.8, geo: 0, hydro: 0.8 } });
  });

  test("constellation 6's buff needs the Lunar reaction within the burst's 1.2 seconds, and nothing below Constellation 6 gains it", () => {
    expect.hasAssertions();
    const sixth = createBurstContext(6);
    triggerLunarReaction(sixth.context, sixth.columbina, sixth.other, LunarReactionType.LunarCharged);
    const late = createBurstContext(6);
    stepKitTestEffects(1.2, late.context);
    triggerLunarReaction(late.context, late.columbina, late.other, LunarReactionType.LunarCharged);
    const fifth = createBurstContext(5);
    triggerLunarReaction(fifth.context, fifth.columbina, fifth.other, LunarReactionType.LunarCharged);

    expect({
      fifth: readPartyCriticalDamage(fifth.context, fifth.columbina, fifth.other, Element.Electro),
      inWindow: readPartyCriticalDamage(sixth.context, sixth.columbina, sixth.other, Element.Electro),
      late: readPartyCriticalDamage(late.context, late.columbina, late.other, Element.Electro),
    }).toStrictEqual({ fifth: 0, inWindow: 0.8, late: 0 });
  });

  test("constellation 6's Lunar-Charged and Lunar-Crystallize buffs both hold a Hydro strike, which takes 160% CRIT DMG", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(6);
    triggerLunarReaction(context, columbina, other, LunarReactionType.LunarCharged);
    triggerLunarReaction(context, columbina, other, LunarReactionType.LunarCrystallize);

    expect({
      electro: readPartyCriticalDamage(context, columbina, other, Element.Electro),
      geo: readPartyCriticalDamage(context, columbina, other, Element.Geo),
      hydro: readPartyCriticalDamage(context, columbina, other, Element.Hydro),
    }).toStrictEqual({ electro: 0.8, geo: 0.8, hydro: 1.6 });
  });

  test("constellation 6 gives Columbina's own Electro strikes the same 80% CRIT DMG after a Lunar-Charged reaction", () => {
    expect.hasAssertions();
    const { columbina, context } = createBurstContext(6);
    triggerLunarReaction(context, columbina, columbina, LunarReactionType.LunarCharged);

    expect(readOwnCriticalDamage(context, columbina, Element.Electro)).toBe(0.8);
  });
});
