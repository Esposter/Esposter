import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BARBARA_CHARACTER_ID, createBarbaraKitBehaviour } from "#src/services/kit/characters/barbaraKit";
import { JEAN_CHARACTER_ID } from "#src/services/kit/characters/jeanKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BARBARA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, BARBARA_CHARACTER_ID);

// The Melody Loop among the team's effects, found by the interval it ticks on
const findMelodyLoop = (kitEffectState: KitEffectState): KitField | undefined =>
  kitEffectState.effects.find(
    (effect): effect is KitField => effect.kind === "field" && effect.tickIntervalSeconds === 5,
  );

// Barbara casting Let the Show Begin♪ as the combatant, the context and the effects it leaves
const castEncoreSkill = (combatant: Combatant) => {
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  BARBARA_KIT.elementalSkill.onStart?.(context);
  return { combatant, context, kitEffectState };
};

// Barbara's collection of particles from the field, which the Melody Loop's Encore hears
const collectParticles = (
  count: number,
  context: ReturnType<typeof createKitTestContext>,
  combatant: Combatant,
): void =>
  BARBARA_KIT.onKitEvent?.(
    {
      characterId: BARBARA_CHARACTER_ID,
      count,
      energyDropKind: EnergyDropKind.Particle,
      kind: KitEventKind.EnergyParticleCollected,
    },
    context,
    combatant,
  );

// Jean falls on a team with Barbara, the kit hearing the fall as Jean's HP's change to nothing
const reportJeanFall = (combatant: Combatant, party: Party, kitEffectState: KitEffectState): void =>
  BARBARA_KIT.onKitEvent?.(
    { characterId: JEAN_CHARACTER_ID, healthShare: -1, kind: KitEventKind.HealthChanged, overflowHealthShare: 0 },
    createKitTestContext({ ...combatant, characterId: JEAN_CHARACTER_ID }, { kitEffectState, party }),
    combatant,
  );

describe(createBarbaraKitBehaviour, () => {
  const MAX_HEALTH = 10_000;
  const createBarbaraCombatant = (constellationCount: number): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: BARBARA_CHARACTER_ID,
    constellationCount,
    elementalResonances: [],
    kit: BARBARA_KIT,
    level: 90,
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const barbara = createBarbaraCombatant(6);
    const party = createParty([BARBARA_CHARACTER_ID, JEAN_CHARACTER_ID]);
    getPartyMember(party, JEAN_CHARACTER_ID).healthShare = 0;

    reportJeanFall(barbara, party, { effects: [] });

    expect(getPartyMember(party, JEAN_CHARACTER_ID).healthShare).toBe(1);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const barbara = createBarbaraCombatant(5);
    const party = createParty([BARBARA_CHARACTER_ID, JEAN_CHARACTER_ID]);
    getPartyMember(party, JEAN_CHARACTER_ID).healthShare = 0;

    reportJeanFall(barbara, party, { effects: [] });

    expect(getPartyMember(party, JEAN_CHARACTER_ID).healthShare).toBe(0);
  });

  test("a second fall within the fifteen minutes is not revived", () => {
    expect.hasAssertions();
    const barbara = createBarbaraCombatant(6);
    const party = createParty([BARBARA_CHARACTER_ID, JEAN_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    getPartyMember(party, JEAN_CHARACTER_ID).healthShare = 0;
    reportJeanFall(barbara, party, kitEffectState);
    getPartyMember(party, JEAN_CHARACTER_ID).healthShare = 0;

    reportJeanFall(barbara, party, kitEffectState);

    expect(getPartyMember(party, JEAN_CHARACTER_ID).healthShare).toBe(0);
  });

  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...BARBARA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(BARBARA_KIT.chargedAttack.hits).talentMultiplier,
      BARBARA_KIT.plungeCollision.talentMultiplier,
      takeOne(BARBARA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(BARBARA_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.3784, 0.3552, 0.4104, 0.552, 1.6624, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("lands Let the Show Begin's two droplets, and its Melody Loop heals the character on the field as it starts and every 5 seconds, four times", () => {
    expect.hasAssertions();
    const combatant = createBarbaraCombatant(0);
    const party = createParty([BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, BARBARA_CHARACTER_ID);
    partyMember.healthShare = 0.1;
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState, party });
    BARBARA_KIT.elementalSkill.onStart?.(context);
    const regenerationHealthShare = (385.18774 + 0.04 * MAX_HEALTH) / MAX_HEALTH;

    // Two seconds in, both droplets have landed and the loop has healed once as it started
    const dropletStrikes = stepKitTestEffects(2, context);

    expect(dropletStrikes.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual([
      [Element.Hydro, 0.584],
      [Element.Hydro, 0.584],
    ]);
    expect(partyMember.healthShare).toBeCloseTo(0.1 + regenerationHealthShare, 4);

    // Its three later heals fall 5, 10 and 15 seconds after the first, and the loop ends with the last
    stepKitEffects(18, context);

    expect(partyMember.healthShare).toBeCloseTo(0.1 + 4 * regenerationHealthShare, 4);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("her strikes heal the party only while her Melody Loop stands, and her charged attack four times as much", () => {
    expect.hasAssertions();
    const combatant = createBarbaraCombatant(0);
    const party = createParty([BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, BARBARA_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    const characterIdCombatantMap = new Map([[BARBARA_CHARACTER_ID, combatant]]);
    const strike = takeOne(takeOne(BARBARA_KIT.normalAttacks).hits);
    const chargedAttack = takeOne(BARBARA_KIT.chargedAttack.hits);
    const kitEffectState: KitEffectState = { effects: [] };
    const hitHealthShare = (72.2227 + 0.0075 * MAX_HEALTH) / MAX_HEALTH;

    expect(
      healKitParty(createKitTestContext(combatant, { characterIdCombatantMap, party }), combatant, combatant, strike),
    ).toBe(false);

    const context = createKitTestContext(combatant, {
      characterIdCombatantMap,
      kitEffectState,
      party,
      random: () => 0.99,
    });
    BARBARA_KIT.elementalSkill.onStart?.(context);
    const isStrikeHealed = healKitParty(context, combatant, combatant, strike);
    const isChargedAttackHealed = healKitParty(context, combatant, combatant, chargedAttack);

    expect([isStrikeHealed, isChargedAttackHealed]).toStrictEqual([true, true]);
    expect(partyMember.healthShare).toBeCloseTo(0.5 + 5 * hitHealthShare, 5);
  });

  test("her burst heals the character on the field once, at 77 frames, and its field is no Melody Loop", () => {
    expect.hasAssertions();
    const combatant = createBarbaraCombatant(0);
    const party = createParty([BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, BARBARA_CHARACTER_ID);
    partyMember.healthShare = 0.1;
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState, party });
    BARBARA_KIT.elementalBurst.onStart?.(context);
    stepKitEffects(76 / 60, context);

    expect(partyMember.healthShare).toBe(0.1);
    expect(healKitParty(context, combatant, combatant, takeOne(takeOne(BARBARA_KIT.normalAttacks).hits))).toBe(false);

    stepKitEffects(1, context);

    expect(partyMember.healthShare).toBeCloseTo(0.1 + (1694.2819 + 0.176 * MAX_HEALTH) / MAX_HEALTH, 4);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 1, []],
    [
      2,
      0.85,
      [
        {
          amount: 0.15,
          attribute: Attribute.HydroDamageBonus,
          characterId: JEAN_CHARACTER_ID,
          kind: "buff",
          secondsRemaining: 15 + 1 / 60,
        },
      ],
    ],
  ])(
    "with %i constellations, her skill's cooldown is multiplied by %f and its Melody Loop gives the Hydro DMG Bonuses %j",
    (constellationCount, cooldownMultiplier, buffs) => {
      expect.hasAssertions();
      const combatant = createBarbaraCombatant(constellationCount);
      const party = createParty([BARBARA_CHARACTER_ID, JEAN_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(combatant, { kitEffectState, party });
      BARBARA_KIT.elementalSkill.onStart?.(context);
      stepKitEffects(3 / 60, context);

      expect(BARBARA_KIT.getSkillCooldownMultiplier?.(context)).toBe(cooldownMultiplier);
      expect(kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual(buffs);
    },
  );

  test("the Ascension 4 passive, Encore, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const { combatant, context, kitEffectState } = castEncoreSkill({ ...createBarbaraCombatant(0), ascension: 4 });
    const loopSeconds = findMelodyLoop(kitEffectState)?.secondsRemaining ?? 0;

    collectParticles(1, context, combatant);

    expect(findMelodyLoop(kitEffectState)?.secondsRemaining).toBe(loopSeconds + 1);
  });

  test("the Ascension 4 passive, Encore, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const { combatant, context, kitEffectState } = castEncoreSkill({ ...createBarbaraCombatant(0), ascension: 3 });
    const loopSeconds = findMelodyLoop(kitEffectState)?.secondsRemaining ?? 0;

    collectParticles(1, context, combatant);

    expect(findMelodyLoop(kitEffectState)?.secondsRemaining).toBe(loopSeconds);
  });

  test("the Ascension 4 passive, Encore, the Melody Loop is extended by at most five seconds", () => {
    expect.hasAssertions();
    const { combatant, context, kitEffectState } = castEncoreSkill({ ...createBarbaraCombatant(0), ascension: 4 });
    const loopSeconds = findMelodyLoop(kitEffectState)?.secondsRemaining ?? 0;

    collectParticles(6, context, combatant);
    collectParticles(1, context, combatant);

    expect(findMelodyLoop(kitEffectState)?.secondsRemaining).toBe(loopSeconds + 5);
  });
});
