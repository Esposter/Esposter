import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
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
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
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

// A second with no Lunar reaction on the field, stepped as the world steps it
const stepGravitySecond = (field: KitField | undefined, context: KitContext): void => {
  if (field) field.onStep?.(context, field, 1);
};

// The team's buffs that still run, other than her HP buff, as the attribute, the amount and whose they are
const readTeamBuffs = (kitEffectState: KitEffectState) =>
  kitEffectState.effects
    .filter(
      (effect): effect is KitBuff =>
        effect.kind === "buff" && effect.secondsRemaining > 0 && effect.attribute !== Attribute.HealthPercent,
    )
    .map(({ amount, attribute, characterId }) => ({ amount, attribute, characterId }));

describe(createColumbinaKitBehaviour, () => {
  const OTHER_CHARACTER_ID = 10_000_052;
  const kitBody = createKitBody({ x: 0, z: 0 });
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
      context.characterIdCombatantMap,
    )?.criticalDamageBonus ?? 0;
  // The CRIT DMG a hit of the given element adds to Columbina's own strike, as her own hook gives it
  const readOwnCriticalDamage = (context: KitContext, columbina: Combatant, element: Element): number =>
    COLUMBINA_KIT.getStrikeCriticalDamageBonus?.(
      { body: kitBody, combatant: columbina, hit: { ...takeOne(COLUMBINA_KIT.elementalBurst.hits), element } },
      c6Enemy,
      context.party,
      context.kitEffectState.effects,
    ) ?? 0;

  // The seconds of Lunar gravity a Gravity Ripple takes to build, at ten a second
  const GRAVITY_SECONDS_PER_RIPPLE = 6;
  // The Lunacy CRIT Rate her charged attack gains from the stacks the effects hold, for the combatant
  const readLunacyCriticalRate = (combatant: Combatant, effects: readonly KitEffect[]): number =>
    COLUMBINA_KIT.getStrikeCriticalRateBonus?.(
      { body: kitBody, combatant, hit: takeOne(COLUMBINA_KIT.chargedAttack.hits) },
      c6Enemy,
      createParty([COLUMBINA_CHARACTER_ID]),
      effects,
    ) ?? 0;
  // A second in which the team triggers the reaction, which the skill's field reads, and then steps it
  const feedGravitySecond = (
    field: KitField | undefined,
    context: KitContext,
    striker: Combatant,
    reactionType: ReactionType,
  ): void => {
    if (!field) return;
    field.onEvent?.(
      { enemy: c6Enemy, kind: KitEventKind.ReactionTriggered, reactions: [{ reactionType }], striker },
      field,
    );
    field.onStep?.(context, field, 1);
  };

  const combatant = createColumbinaCombatant();
  // The CRIT Rate her charged attack gains after the given Gravity Ripples, each built by six seconds of Lunar-Charged gravity
  const getCriticalRateBonus = (ascension: number, ripples: number): number => {
    const ascendedCombatant: Combatant = { ...combatant, ascension };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(ascendedCombatant, { kitEffectState });
    COLUMBINA_KIT.elementalSkill.onStart?.(context);
    const [field] = kitEffectState.effects as KitField[];
    for (let second = 0; second < ripples * GRAVITY_SECONDS_PER_RIPPLE; second++)
      feedGravitySecond(field, context, ascendedCombatant, LunarReactionType.LunarCharged);
    return readLunacyCriticalRate(ascendedCombatant, kitEffectState.effects);
  };

  // Columbina's skill pressed into the effects at the given constellation and ascension, with its field and context
  const pressSkill = (kitEffectState: KitEffectState, constellationCount = 0, ascension = 0) => {
    const pressed: Combatant = { ...combatant, ascension, constellationCount };
    const context = createKitTestContext(pressed, { kitEffectState });
    COLUMBINA_KIT.elementalSkill.onStart?.(context);
    const field = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    return { context, field, pressed };
  };
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

  test("ascension 1's Lunacy takes effect as a passive at its ascension phase", () => {
    expect.hasAssertions();

    expect(getCriticalRateBonus(1, 1)).toBeCloseTo(0.05);
  });

  test("ascension 1's Lunacy does not take effect as a passive below its ascension phase", () => {
    expect.hasAssertions();

    expect(getCriticalRateBonus(0, 3)).toBe(0);
  });

  test("ascension 1's Lunacy stacks up to three with each Gravity Ripple", () => {
    expect.hasAssertions();

    expect(getCriticalRateBonus(1, 2)).toBeCloseTo(0.1);
    expect(getCriticalRateBonus(1, 5)).toBeCloseTo(0.15);
  });

  test("ascension 1's Lunacy gets no stack from a DoT tick, as gcsim gives it on the Gravity Ripple alone", () => {
    expect.hasAssertions();

    const ascendedCombatant: Combatant = { ...combatant, ascension: 1 };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(ascendedCombatant, { kitEffectState });
    COLUMBINA_KIT.elementalSkill.onStart?.(context);
    const [field] = kitEffectState.effects as KitField[];
    for (let tick = 0; tick < 3; tick++) field?.onTick(context, 0);

    expect(readLunacyCriticalRate(ascendedCombatant, kitEffectState.effects)).toBe(0);
  });

  test("gravity interference builds ten gravity a second for the two seconds after a Lunar reaction, so six seconds of it fire a Gravity Ripple", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const { context, field, pressed } = pressSkill(kitEffectState, 0, 1);
    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE - 1; second++)
      feedGravitySecond(field, context, pressed, LunarReactionType.LunarCharged);
    expect(readLunacyCriticalRate(pressed, kitEffectState.effects)).toBe(0);

    feedGravitySecond(field, context, pressed, LunarReactionType.LunarCharged);
    expect(readLunacyCriticalRate(pressed, kitEffectState.effects)).toBeCloseTo(0.05);
  });

  test("gravity interference builds gravity only in the two seconds after a Lunar reaction, so a second with none adds nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const { context, field, pressed } = pressSkill(kitEffectState, 0, 1);
    feedGravitySecond(field, context, pressed, LunarReactionType.LunarCharged);
    for (let second = 0; second < 6; second++) stepGravitySecond(field, context);
    expect(readLunacyCriticalRate(pressed, kitEffectState.effects)).toBe(0);

    for (let second = 0; second < 3; second++)
      feedGravitySecond(field, context, pressed, LunarReactionType.LunarCharged);
    expect(readLunacyCriticalRate(pressed, kitEffectState.effects)).toBe(0);

    feedGravitySecond(field, context, pressed, LunarReactionType.LunarCharged);
    expect(readLunacyCriticalRate(pressed, kitEffectState.effects)).toBeCloseTo(0.05);
  });

  test("gravity interference keeps the gravity built by a press while the skill stands, as gcsim clears it only when no skill stands", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const first = pressSkill(kitEffectState, 0, 1);
    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE - 1; second++)
      feedGravitySecond(first.field, first.context, first.pressed, LunarReactionType.LunarCharged);
    const second = pressSkill(kitEffectState, 0, 1);
    feedGravitySecond(second.field, second.context, second.pressed, LunarReactionType.LunarCharged);

    expect(readLunacyCriticalRate(second.pressed, kitEffectState.effects)).toBeCloseTo(0.05);
  });

  test("gravity interference starts from no gravity on a press with no skill standing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const first = pressSkill(kitEffectState, 0, 1);
    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE - 1; second++)
      feedGravitySecond(first.field, first.context, first.pressed, LunarReactionType.LunarCharged);
    kitEffectState.effects = [];
    const second = pressSkill(kitEffectState, 0, 1);
    feedGravitySecond(second.field, second.context, second.pressed, LunarReactionType.LunarCharged);

    expect(readLunacyCriticalRate(second.pressed, kitEffectState.effects)).toBe(0);
  });

  test("gravity interference fires a Gravity Ripple at once on a constellation 1 press, giving the active member six energy for Lunar-Charged, then waits fifteen seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const { context } = pressSkill(kitEffectState, 1);
    expect(getPartyMember(context.party, COLUMBINA_CHARACTER_ID).energy).toBe(6);

    COLUMBINA_KIT.elementalSkill.onStart?.(context);
    expect(getPartyMember(context.party, COLUMBINA_CHARACTER_ID).energy).toBe(6);

    stepKitTestEffects(15, context);
    COLUMBINA_KIT.elementalSkill.onStart?.(context);
    expect(getPartyMember(context.party, COLUMBINA_CHARACTER_ID).energy).toBe(12);
  });

  test("gravity interference shields her for 12% of her max HP for eight seconds from a constellation 1 Lunar-Crystallize ripple", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const { context, field, pressed } = pressSkill(kitEffectState, 1);
    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE; second++)
      feedGravitySecond(field, context, pressed, LunarReactionType.LunarCrystallize);

    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    expect(shield?.characterId).toBe(COLUMBINA_CHARACTER_ID);
    expect(shield?.element).toBe(Element.Hydro);
    expect(shield?.secondsRemaining).toBe(8);
    expect(shield?.health).toBeCloseTo(0.12 * pressed.attributes.maxHealth);
  });

  test("gravity interference's Lunar-Crystallize shield is 12% of her max HP at constellation 1, and her constellation 2 buff raises it", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const { context, field, pressed } = pressSkill(kitEffectState, 2);
    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE; second++)
      feedGravitySecond(field, context, pressed, LunarReactionType.LunarCrystallize);

    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    expect(shield?.health).toBeCloseTo(0.12 * 1.4 * pressed.attributes.maxHealth);
  });

  test("gravity interference gives her 40% max HP for eight seconds with each Gravity Ripple at constellation 2", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    pressSkill(kitEffectState, 2);
    const healthBuff = kitEffectState.effects.find(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.HealthPercent,
    );

    expect(healthBuff?.amount).toBe(0.4);
    expect(healthBuff?.characterId).toBe(COLUMBINA_CHARACTER_ID);
    expect(healthBuff?.secondsRemaining).toBe(8);
  });

  test("gravity interference gives the active member 1% of her max HP in ATK from a constellation 2 Lunar-Charged ripple, and a Lunar-Crystallize one moves it to DEF", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const pressed: Combatant = { ...combatant, constellationCount: 2 };
    const characterIdCombatantMap = new Map<number, Combatant>([
      [COLUMBINA_CHARACTER_ID, pressed],
      ...MOONSIGN_CHARACTER_IDS.map((characterId): [number, Combatant] => [
        characterId,
        { ...combatant, characterId, kit: MOONSIGN_KIT },
      ]),
    ]);
    const context = createKitTestContext(pressed, {
      characterIdCombatantMap,
      kitEffectState,
      party: createParty([COLUMBINA_CHARACTER_ID, ...MOONSIGN_CHARACTER_IDS]),
    });
    COLUMBINA_KIT.elementalSkill.onStart?.(context);
    const [field] = kitEffectState.effects as KitField[];
    const [attack] = readTeamBuffs(kitEffectState);
    expect(attack?.attribute).toBe(Attribute.Attack);
    expect(attack?.characterId).toBe(COLUMBINA_CHARACTER_ID);
    expect(attack?.amount).toBeCloseTo(0.01 * 1.4 * pressed.attributes.maxHealth);

    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE; second++)
      feedGravitySecond(field, context, pressed, LunarReactionType.LunarCrystallize);
    expect(readTeamBuffs(kitEffectState).map(({ attribute }) => attribute)).toStrictEqual([Attribute.Defense]);
  });

  test("gravity interference's team buffs at constellation 2 need the Moonsign to reach Ascendant Gleam, so a team without it gives none", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const { context, field, pressed } = pressSkill(kitEffectState, 2);
    for (let second = 0; second < GRAVITY_SECONDS_PER_RIPPLE; second++)
      feedGravitySecond(field, context, pressed, LunarReactionType.LunarCharged);

    expect(readTeamBuffs(kitEffectState)).toStrictEqual([]);
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

  test("ascension 4's Moonridge Dew is given to the party by a Lunar-Bloom in the burst's window", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(0);
    triggerLunarReaction(context, { ...columbina, ascension: 4 }, other, LunarReactionType.LunarBloom);

    expect(context.party.moonridgeDew).toBe(1);
  });

  test("ascension 4's Moonridge Dew is given by no Lunar-Bloom below Ascension 4", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(0);
    triggerLunarReaction(context, { ...columbina, ascension: 3 }, other, LunarReactionType.LunarBloom);

    expect(context.party.moonridgeDew).toBe(0);
  });

  test("ascension 4's Moonridge Dew is given by a Lunar-Bloom only, not by a Lunar-Charged reaction", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(0);
    triggerLunarReaction(context, { ...columbina, ascension: 4 }, other, LunarReactionType.LunarCharged);

    expect(context.party.moonridgeDew).toBe(0);
  });

  test("ascension 4's Moonridge Dew is given by no Lunar-Bloom after the burst's window", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(0);
    stepKitTestEffects(2, context);
    triggerLunarReaction(context, { ...columbina, ascension: 4 }, other, LunarReactionType.LunarBloom);

    expect(context.party.moonridgeDew).toBe(0);
  });

  test("ascension 4's Moonridge Dew is gained once for two Lunar-Blooms at the same instant, as gcsim's three-frame cooldown gives", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(0);
    const ascended = { ...columbina, ascension: 4 };
    triggerLunarReaction(context, ascended, other, LunarReactionType.LunarBloom);
    triggerLunarReaction(context, ascended, other, LunarReactionType.LunarBloom);

    expect(context.party.moonridgeDew).toBe(1);
  });

  test("ascension 4's Moonridge Dew is gained at most three times in an eighteen-second window, and a burst after that window runs out gains it again", () => {
    expect.hasAssertions();
    const { columbina, context, other } = createBurstContext(0);
    const ascended = { ...columbina, ascension: 4 };
    for (let index = 0; index < 4; index++) {
      triggerLunarReaction(context, ascended, other, LunarReactionType.LunarBloom);
      stepKitTestEffects(0.1, context);
    }
    // The three gains fill the party's Moonridge Dew, and the fourth gives none within the window
    expect(context.party.moonridgeDew).toBe(3);

    context.party.moonridgeDew = 0;
    triggerLunarReaction(context, ascended, other, LunarReactionType.LunarBloom);
    expect(context.party.moonridgeDew).toBe(0);

    stepKitTestEffects(19, context);
    COLUMBINA_KIT.elementalBurst?.onStart?.(context);
    triggerLunarReaction(context, ascended, other, LunarReactionType.LunarBloom);
    expect(context.party.moonridgeDew).toBe(1);
  });

  test("a charged attack variant, Moondew Cleanse, stands for a charged attack with Dew to spend, and without Dew it is her normal charged attack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createColumbinaCombatant(), { party: createParty([COLUMBINA_CHARACTER_ID]) });
    expect(COLUMBINA_KIT.chargedAttackVariant?.checkIsActive(context)).toBe(false);

    context.party.moonridgeDew = 1;
    expect(COLUMBINA_KIT.chargedAttackVariant?.checkIsActive(context)).toBe(true);
  });

  test("a charged attack variant, Moondew Cleanse, spends no stamina, and her normal charged attack spends the table's", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createColumbinaCombatant(), { party: createParty([COLUMBINA_CHARACTER_ID]) });
    const readSpentStamina = (): number =>
      COLUMBINA_KIT.chargedAttackStamina * (COLUMBINA_KIT.getChargedAttackStaminaMultiplier?.(context) ?? 1);
    expect(readSpentStamina()).toStrictEqual(COLUMBINA_KIT.chargedAttackStamina);

    context.party.moonridgeDew = 1;
    expect(readSpentStamina()).toBe(0);
  });

  test("a charged attack variant, Moondew Cleanse, spends one Dew, from the verdant first", () => {
    expect.hasAssertions();

    const context = createKitTestContext(createColumbinaCombatant(), { party: createParty([COLUMBINA_CHARACTER_ID]) });
    context.party.verdantDew.count = 1;
    context.party.moonridgeDew = 2;
    COLUMBINA_KIT.chargedAttackVariant?.action.onStart?.(context);

    expect(context.party.verdantDew.count).toBe(0);
    expect(context.party.moonridgeDew).toBe(2);
  });

  test("a charged attack variant, Moondew Cleanse, ignores all of the enemy's DEF on each of its Lunar-Bloom hits, and her normal charged attack ignores none", () => {
    expect.hasAssertions();

    const columbina = createColumbinaCombatant();
    const context = createKitTestContext(columbina, { party: createParty([COLUMBINA_CHARACTER_ID]) });
    const readDefenceIgnored = (hit: KitHit) =>
      COLUMBINA_KIT.getStrikeDefenceIgnored?.(
        { attackTag: AttackTag.ChargedAttack, body: kitBody, combatant: columbina, hit },
        c6Enemy,
        context.party,
        context.kitEffectState.effects,
      ) ?? 0;
    const variantHits = COLUMBINA_KIT.chargedAttackVariant?.action.hits ?? [];

    expect(variantHits).toHaveLength(3);
    for (const hit of variantHits) expect(readDefenceIgnored(hit)).toBe(1);
    expect(readDefenceIgnored(takeOne(COLUMBINA_KIT.chargedAttack.hits))).toBe(0);
  });
});
