import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createJahodaKitBehaviour, JAHODA_CHARACTER_ID } from "#src/services/kit/characters/jahodaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeKitEnemies } from "#src/services/kit/strikeKitEnemies";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const JAHODA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, JAHODA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// A made-up character who holds a Moonsign Benediction, so the team reads as Ascendant Gleam with Jahoda's own
const MOONSIGN_PARTNER_CHARACTER_ID = 1;
const MOONSIGN_BENEDICTION = { lunarReactionTypes: [LunarReactionType.LunarCharged] };
const createJahodaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: JAHODA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: JAHODA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// Constellation 6's buff sources, made up, as the buff a source names restarts only itself
const CONSTELLATION_6_SOURCE = "jahoda-constellation-6";

// A team of Jahoda and a partner. Jahoda's kit holds a Moonsign Benediction, as a Moonsign character's kit does.
// Its partner's does too when the team is to be at Ascendant Gleam. One enemy holding an aura stands at the origin.
// Jahoda's pursuit is returned, so a test can run its ticks until the flask drains
const createConstellation6Context = (constellationCount: number, isPartnerMoonsign: boolean) => {
  const combatant: Combatant = {
    ...createJahodaCombatant(),
    constellationCount,
    kit: { ...JAHODA_KIT, moonsignBenediction: MOONSIGN_BENEDICTION },
  };
  const partner: Combatant = {
    ...createJahodaCombatant(),
    characterId: MOONSIGN_PARTNER_CHARACTER_ID,
    kit: { ...JAHODA_KIT, moonsignBenediction: isPartnerMoonsign ? MOONSIGN_BENEDICTION : undefined },
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  applyElement(enemy.elementalState, Element.Pyro, 1);
  const context = createKitTestContext(combatant, {
    characterIdCombatantMap: new Map([
      [combatant.characterId, combatant],
      [partner.characterId, partner],
    ]),
    enemyMap: new Map([[enemy.id, enemy]]),
    enemyTables,
    party: createParty([combatant.characterId, partner.characterId]),
  });
  JAHODA_KIT.elementalSkill.onStart?.(context);
  const [pursuit] = context.kitEffectState.effects;
  if (pursuit?.kind !== "field") throw new Error("The press casts no pursuit");
  return { context, partner, pursuit };
};

// Runs the pursuit's ticks until the flask drains, which casts its drain's summon, within a bounded number of ticks
const fillFlaskUntilDrained = (
  pursuit: { onTick: (context: ReturnType<typeof createKitTestContext>, tickIndex: number) => void },
  context: ReturnType<typeof createKitTestContext>,
): void => {
  for (let tickIndex = 0; tickIndex < 100; tickIndex++) {
    pursuit.onTick(context, tickIndex);
    if (context.kitEffectState.effects.some(({ kind }) => kind === "summon")) return;
  }
  throw new Error("The flask never drains");
};

// Jahoda and a partner on a team of two, with her burst cast, each member at the health share given. Her Max HP is large,
// So a heal moves a share too small to lift her past 70% of it over the burst's ticks
const createBurstHealContext = (activeHealthShare: number, partnerHealthShare: number, ascension = 0) => {
  const combatant: Combatant = {
    ...createJahodaCombatant(),
    ascension,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 100_000 }]),
    kit: JAHODA_KIT,
  };
  const partner: Combatant = { ...combatant, characterId: MOONSIGN_PARTNER_CHARACTER_ID };
  const party = createParty([combatant.characterId, partner.characterId]);
  const setHealthShare = (characterId: number, healthShare: number): void => {
    const member = party.characterIdMemberMap.get(characterId);
    if (member) party.characterIdMemberMap.set(characterId, { ...member, healthShare });
  };
  setHealthShare(combatant.characterId, activeHealthShare);
  setHealthShare(partner.characterId, partnerHealthShare);
  const context = createKitTestContext(combatant, {
    characterIdCombatantMap: new Map([
      [combatant.characterId, combatant],
      [partner.characterId, partner],
    ]),
    party,
  });
  JAHODA_KIT.elementalBurst?.onStart?.(context);
  return context;
};

// Jahoda's burst cast at Ascendant Gleam, with an enemy holding an aura at the origin for the robots to absorb and strike
const createRobotBurstContext = () => {
  const combatant: Combatant = {
    ...createJahodaCombatant(),
    kit: { ...JAHODA_KIT, moonsignBenediction: MOONSIGN_BENEDICTION },
  };
  const partner: Combatant = {
    ...createJahodaCombatant(),
    characterId: MOONSIGN_PARTNER_CHARACTER_ID,
    kit: { ...JAHODA_KIT, moonsignBenediction: MOONSIGN_BENEDICTION },
  };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  applyElement(enemy.elementalState, Element.Pyro, 1);
  const context = createKitTestContext(combatant, {
    characterIdCombatantMap: new Map([
      [combatant.characterId, combatant],
      [partner.characterId, partner],
    ]),
    enemyMap: new Map([[enemy.id, enemy]]),
    party: createParty([combatant.characterId, partner.characterId]),
  });
  JAHODA_KIT.elementalBurst?.onStart?.(context);
  return context;
};

// The frames, counted from the cast, on which a member's health share rises, over the burst's frames
const readHealedFrames = (context: ReturnType<typeof createBurstHealContext>, characterId: number): number[] => {
  const healedFrames: number[] = [];
  let healthShare = getPartyMember(context.party, characterId).healthShare;
  for (let frame = 1; frame <= 800; frame++) {
    stepKitEffects(1 / 60, context);
    const nextHealthShare = getPartyMember(context.party, characterId).healthShare;
    if (nextHealthShare > healthShare) healedFrames.push(frame);
    healthShare = nextHealthShare;
  }
  return healedFrames;
};

describe(createJahodaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...JAHODA_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(JAHODA_KIT.chargedAttack.hits).talentMultiplier,
      JAHODA_KIT.plungeCollision.talentMultiplier,
      takeOne(JAHODA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(JAHODA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(JAHODA_KIT.elementalBurst.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.416739, 0.192313, 0.192313, 0.511975, 1.24, 0.568288, 1.136335, 1.419344, 2.072,
    ]);
  });

  test("each strike lands 10 frames after its hitmark, and each action cancels at its walk frame", () => {
    expect.hasAssertions();
    expect(
      JAHODA_KIT.normalAttacks.map((action) => ({
        cancelFrames: Math.round(action.seconds * 60),
        hitFrames: action.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      })),
    ).toStrictEqual([
      { cancelFrames: 35, hitFrames: [24] },
      { cancelFrames: 52, hitFrames: [25, 39] },
      { cancelFrames: 99, hitFrames: [50] },
    ]);
  });

  test("the press starts the pursuit with no hit, and its second press drains an unfilled flask at 4 frames", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(createJahodaCombatant(), { kitEffectState });
    JAHODA_KIT.elementalSkill.onStart?.(context);
    expect(kitEffectState.effects.map(({ kind }) => kind)).toStrictEqual(["field", "status", "field"]);
    const drain = takeOne(JAHODA_KIT.elementalSkillChain?.followUps ?? []);
    drain.onStart?.(context);
    expect(kitEffectState.effects).toHaveLength(1);
    const [summon] = kitEffectState.effects;
    expect(summon?.kind === "summon" && takeOne(summon.hits)).toStrictEqual({
      element: Element.Anemo,
      gauge: 1,
      hitArea: { angle: 2 * Math.PI, height: 5, radius: 5 },
      hitmarkSeconds: 4 / 60,
      poiseDamage: 0,
      talentMultiplier: 1.908,
    });
  });

  test("constellation 6 buffs each Moonsign member's Crit Rate and Crit DMG for 20 seconds when a full flask drains at Ascendant Gleam", () => {
    expect.hasAssertions();
    const { context, partner, pursuit } = createConstellation6Context(6, true);
    fillFlaskUntilDrained(pursuit, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual(
      [JAHODA_CHARACTER_ID, partner.characterId].flatMap((characterId) => [
        {
          amount: 0.05,
          attribute: Attribute.CriticalRate,
          characterId,
          kind: "buff",
          secondsRemaining: 20,
          source: CONSTELLATION_6_SOURCE,
        },
        {
          amount: 0.4,
          attribute: Attribute.CriticalDamage,
          characterId,
          kind: "buff",
          secondsRemaining: 20,
          source: CONSTELLATION_6_SOURCE,
        },
      ]),
    );
  });

  test("constellation 6 buffs nothing when the team is only Nascent Gleam", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(6, false);
    fillFlaskUntilDrained(pursuit, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });

  test("constellation 5 buffs nothing when the team is at Ascendant Gleam", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(5, true);
    fillFlaskUntilDrained(pursuit, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });

  test("her Hidden Aces heals the active character on each of its nine ticks, from the 12th frame every 87 frames", () => {
    expect.hasAssertions();
    const context = createBurstHealContext(0.1, 1);
    expect(readHealedFrames(context, JAHODA_CHARACTER_ID)).toStrictEqual([12, 99, 186, 273, 360, 447, 534, 621, 708]);
  });

  test("above 70% of her health, Hidden Aces heals the lowest member as well, on its first tick", () => {
    expect.hasAssertions();
    const context = createBurstHealContext(0.9, 0.4);
    expect(readHealedFrames(context, MOONSIGN_PARTNER_CHARACTER_ID)).toContain(12);
  });

  test("at 70% of her health or below, Hidden Aces heals no member but the active one", () => {
    expect.hasAssertions();
    const context = createBurstHealContext(0.5, 0.4);
    expect(readHealedFrames(context, MOONSIGN_PARTNER_CHARACTER_ID)).toStrictEqual([]);
  });

  test("at Ascension 4, a heal tick above 70% of her health gives the active character Elemental Mastery for six seconds", () => {
    expect.hasAssertions();
    const context = createBurstHealContext(0.9, 0.4, 4);
    for (let frame = 0; frame < 12; frame++) stepKitEffects(1 / 60, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([
      {
        amount: 100,
        attribute: Attribute.ElementalMastery,
        characterId: JAHODA_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 6,
        source: "jahoda-ascension-4",
      },
    ]);
  });

  test("below Ascension 4, a heal tick gives no Elemental Mastery", () => {
    expect.hasAssertions();
    const context = createBurstHealContext(0.9, 0.4, 3);
    for (let frame = 0; frame < 12; frame++) stepKitEffects(1 / 60, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });

  test("at Ascension 4, at 70% of her health or below, a heal tick gives no Elemental Mastery", () => {
    expect.hasAssertions();
    const context = createBurstHealContext(0.5, 0.4, 4);
    for (let frame = 0; frame < 12; frame++) stepKitEffects(1 / 60, context);
    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });

  test("at Ascendant Gleam, each robot strike counts Hidden Aces' robot internal cooldown", () => {
    expect.hasAssertions();
    const context = createRobotBurstContext();
    const strikes = [];
    for (let frame = 0; frame < 300; frame++) strikes.push(...stepKitTestEffects(1 / 60, context));
    expect(strikes.length).toBeGreaterThan(0);
    expect(new Set(strikes.map(({ hit }) => hit.internalCooldownTag))).toStrictEqual(
      new Set([InternalCooldownTag.JahodaRobotStrike]),
    );
  });

  test("at Ascendant Gleam, a full flask's drain fires ten Meowballs from 129 frames, every 116 frames, at the absorbed element", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(0, true);
    fillFlaskUntilDrained(pursuit, context);
    const meowballs: { element?: Element; frame: number }[] = [];
    for (let frame = 1; frame <= 1300; frame++)
      for (const { hit, hitbox } of stepKitTestEffects(1 / 60, context))
        if (hitbox !== undefined) meowballs.push({ element: hit.element, frame });
    expect(meowballs.map(({ frame }) => frame)).toStrictEqual([129, 245, 361, 477, 593, 709, 825, 941, 1057, 1173]);
    expect(new Set(meowballs.map(({ element }) => element))).toStrictEqual(new Set([Element.Pyro]));
  });

  test("each Meowball strikes the primary target, not the living enemy nearest her body", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(0, true);
    for (const enemy of context.enemyMap.values()) enemy.position = { ...context.body.position };
    const far = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    far.position = { x: context.body.position.x + 10, z: context.body.position.z };
    context.enemyMap.set("far", far);
    context.primaryTarget = far;
    fillFlaskUntilDrained(pursuit, context);
    const targets = [];
    for (let frame = 1; frame <= 129; frame++)
      for (const { hitbox, target } of stepKitTestEffects(1 / 60, context))
        if (hitbox !== undefined) targets.push(target);
    expect(targets).toStrictEqual([far]);
  });

  test("below Ascendant Gleam, a full flask's drain fires no Meowball", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(0, false);
    fillFlaskUntilDrained(pursuit, context);
    const strikes = [];
    for (let frame = 0; frame < 1300; frame++) strikes.push(...stepKitTestEffects(1 / 60, context));
    expect(strikes.filter(({ hitbox }) => hitbox !== undefined)).toHaveLength(0);
  });

  test("each Meowball gives Jahoda 2 energy, and no Meowball gives it again within 3.5 seconds of the last", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(0, true);
    fillFlaskUntilDrained(pursuit, context);
    // The enemy outlasts the Meowballs, so each one that falls reaches it
    for (const enemy of context.enemyMap.values()) enemy.health = 1_000_000_000;
    const energyBefore = getPartyMember(context.party, JAHODA_CHARACTER_ID).energy;
    for (let frame = 0; frame < 1300; frame++) {
      stepKitEffects(1 / 60, context);
      if (context.strikes.length > 0) strikeKitEnemies(context.strikes, context);
    }
    // Five Meowballs fall 3.5 seconds or more after the last that gave energy: those on the 129th, 361st, 593rd, 825th and 1057th frames
    expect(getPartyMember(context.party, JAHODA_CHARACTER_ID).energy - energyBefore).toBe(10);
  });

  test("a full flask drained again at Ascendant Gleam replaces the Meowballs still running", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(0, true);
    fillFlaskUntilDrained(pursuit, context);
    const strikes = [];
    for (let frame = 0; frame < 400; frame++) strikes.push(...stepKitTestEffects(1 / 60, context));
    JAHODA_KIT.elementalSkill.onStart?.(context);
    const secondPursuit = context.kitEffectState.effects.find(
      (effect) => effect.kind === "field" && effect.id === "jahoda-pursuit",
    );
    if (secondPursuit?.kind !== "field") throw new Error("The second press casts no pursuit");
    fillFlaskUntilDrained(secondPursuit, context);
    for (let frame = 0; frame < 1300; frame++) strikes.push(...stepKitTestEffects(1 / 60, context));
    // The first run strikes three times before the second drain, which stops it, and the second run strikes ten times
    expect(strikes.filter(({ hitbox }) => hitbox !== undefined)).toHaveLength(13);
  });

  test("a press of Savvy Strategy while Meowballs run ends them, as gcsim's cast zeroes the flask and stops their ticks", () => {
    expect.hasAssertions();
    const { context, pursuit } = createConstellation6Context(0, true);
    fillFlaskUntilDrained(pursuit, context);
    // The enemy stands out of the new pursuit's absorb circle, so the press refills nothing, and the Meowballs still find it
    for (const enemy of context.enemyMap.values()) enemy.position = { x: 100, z: 0 };
    const meowballFrames: number[] = [];
    for (let frame = 1; frame <= 400; frame++)
      if (stepKitTestEffects(1 / 60, context).some(({ hitbox }) => hitbox !== undefined)) meowballFrames.push(frame);
    JAHODA_KIT.elementalSkill.onStart?.(context);
    for (let frame = 401; frame <= 1300; frame++)
      if (stepKitTestEffects(1 / 60, context).some(({ hitbox }) => hitbox !== undefined)) meowballFrames.push(frame);
    // The three Meowballs that fall before the press, and none after it
    expect(meowballFrames).toStrictEqual([129, 245, 361]);
  });
});
