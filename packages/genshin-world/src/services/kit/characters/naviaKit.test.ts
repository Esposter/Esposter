import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInfusion } from "#src/models/kit/KitInfusion";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createNaviaKitBehaviour, NAVIA_CHARACTER_ID } from "#src/services/kit/characters/naviaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NAVIA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NAVIA_CHARACTER_ID);
const createNaviaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: NAVIA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: NAVIA_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});
const createNaviaTeamMember = (element: Element): Combatant => ({ ...createNaviaCombatant(), element });

const getStatus = (kitEffectState: KitEffectState, id: string): KitStatus | undefined =>
  kitEffectState.effects.find((effect): effect is KitStatus => effect.kind === "status" && effect.id === id);
// An internal cooldown runs out as its seconds do, which a test stands in for by ending it
const endCooldown = (kitEffectState: KitEffectState, id: string): void => {
  const status = getStatus(kitEffectState, id);
  if (status) status.secondsRemaining = 0;
};
const countSummons = (kitEffectState: KitEffectState): number =>
  kitEffectState.effects.filter((effect) => effect.kind === "summon").length;

const getBlastHit = (): KitHit => takeOne(NAVIA_KIT.elementalBurst.hits);
const getCannonSummon = (kitEffectState: KitEffectState): KitSummon =>
  takeOne(kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"));

// The Geo RES cut a burst hit applies to an enemy, from a constellation count
const shredAt = (constellationCount: number) => getBlastHit().enemyStatus?.(createNaviaCombatant(constellationCount));

// The effects an action's start adds to the team's, given the team's effects it starts on
const startAction = (action: KitAction, kitEffectState: KitEffectState, combatant = createNaviaCombatant()): void =>
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));

// The infusions Rosula Shardshot's press leaves on Navia at the ascension
const castShotInfusions = (ascension: number): KitInfusion[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  startAction(NAVIA_KIT.elementalSkill, kitEffectState, { ...createNaviaCombatant(), ascension });
  return kitEffectState.effects.filter((effect): effect is KitInfusion => effect.kind === "infusion");
};

describe(createNaviaKitBehaviour, () => {
  // The Crystal Shrapnel a shot leaves after five cannon hits, from a constellation count
  const shrapnelAfterShot = (constellationCount: number): number => {
    const combatant = createNaviaCombatant(constellationCount);
    const kitEffectState: KitEffectState = { effects: [] };
    for (let strike = 0; strike < 5; strike++) {
      strikeHit(getBlastHit(), kitEffectState, combatant);
      endCooldown(kitEffectState, BURST_SHRAPNEL_ICD_STATUS_ID);
    }
    startAction(NAVIA_KIT.elementalSkill, kitEffectState, combatant);
    return readShrapnel(kitEffectState);
  };

  const readShrapnel = (kitEffectState: KitEffectState): number =>
    getStatus(kitEffectState, SHRAPNEL_STATUS_ID)?.stacks ?? 0;

  // A hit landing on one enemy from the team's effects
  const strikeHit = (hit: KitHit, kitEffectState: KitEffectState, combatant = createNaviaCombatant()): void =>
    hit.onStrike?.(createKitTestContext(combatant, { kitEffectState }), { body: kitBody, combatant, hit });

  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  const SHRAPNEL_STATUS_ID = "navia-crystal-shrapnel";
  const BURST_SHRAPNEL_ICD_STATUS_ID = "navia-burst-shrapnel-icd";
  const ARKHE_ICD_STATUS_ID = "navia-arkhe-icd";

  test("reads her strikes', charged attack's, plunges', and burst's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NAVIA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...NAVIA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      NAVIA_KIT.plungeCollision.talentMultiplier,
      takeOne(NAVIA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NAVIA_KIT.highPlunge.hits).talentMultiplier,
      getBlastHit().talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.93519, 0.865065, 0.348859, 0.348859, 0.348859, 1.334316, 0.62522, 1.1309, 0.745878, 1.49144, 1.862889, 0.752,
    ]);
  });

  test("her skill and burst cool for nine and fifteen seconds, her burst costs 60 energy, and her skill holds two charges", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NAVIA_KIT.burstCooldownSeconds,
      burstEnergyCost: NAVIA_KIT.burstEnergyCost,
      elementalSkillCharges: NAVIA_KIT.elementalSkillCharges,
      skillCooldownSeconds: NAVIA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      elementalSkillCharges: 2,
      skillCooldownSeconds: 9,
    });
  });

  test("cannon fire support's shots land at gcsim's spacing, every 42 frames and every third 48, from 163 frames", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startAction(NAVIA_KIT.elementalBurst, kitEffectState);

    expect(
      getCannonSummon(kitEffectState)
        .hits.slice(0, 5)
        .map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    ).toStrictEqual([163, 205, 253, 295, 337]);
  });

  test("a cannon hit gains a crystal shrapnel once per 2.4 second cooldown, and holds six at most", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    const blastHit = getBlastHit();
    const stacks: number[] = [];
    for (let strike = 0; strike < 7; strike++) {
      strikeHit(blastHit, kitEffectState);
      stacks.push(readShrapnel(kitEffectState));
      endCooldown(kitEffectState, BURST_SHRAPNEL_ICD_STATUS_ID);
    }

    expect(stacks).toStrictEqual([1, 2, 3, 4, 5, 6, 6]);
  });

  test("a cannon hit that gains a crystal shrapnel starts its 2.4 second cooldown", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    strikeHit(getBlastHit(), kitEffectState);

    expect(getStatus(kitEffectState, BURST_SHRAPNEL_ICD_STATUS_ID)?.secondsRemaining).toBe(2.4);
  });

  test("rosula shardshot spends the crystal shrapnel it has, and constellation 6 keeps the stacks past three", () => {
    expect.hasAssertions();
    expect({ base: shrapnelAfterShot(0), constellation6: shrapnelAfterShot(6) }).toStrictEqual({
      base: 0,
      constellation6: 2,
    });
  });

  test("surging blade lands 75 frames into a press, and its cooldown keeps a second blade out for seven seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    startAction(NAVIA_KIT.elementalSkill, kitEffectState);
    const blade = takeOne(kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"));
    startAction(NAVIA_KIT.elementalSkill, kitEffectState);
    const bladeCount = countSummons(kitEffectState);
    endCooldown(kitEffectState, ARKHE_ICD_STATUS_ID);
    startAction(NAVIA_KIT.elementalSkill, kitEffectState);

    expect({
      bladeCount,
      bladeCountAfterCooldown: countSummons(kitEffectState),
      bladeFrames: Math.round(takeOne(blade.hits).hitmarkSeconds * 60),
    }).toStrictEqual({ bladeCount: 1, bladeCountAfterCooldown: 2, bladeFrames: 75 });
  });

  test("constellation 4 cuts geo RES by 20% for eight seconds on what a burst hits, and nothing before it", () => {
    expect.hasAssertions();
    expect({ base: shredAt(0), constellation4: shredAt(4) }).toStrictEqual({
      base: undefined,
      constellation4: {
        damageTakenBonus: 0,
        id: "navia-c4-shred",
        resistanceReduction: { Rock: 0.2 },
        secondsRemaining: 8,
      },
    });
  });
});

describe("undisclosed Distribution Channels", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castShotInfusions(1)).toStrictEqual([
      {
        characterId: NAVIA_CHARACTER_ID,
        damageBonus: 0.4,
        element: Element.Geo,
        kind: "infusion",
        secondsRemaining: 4,
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castShotInfusions(0)).toStrictEqual([]);
  });

  test("the Ascension 4 ATK raises Navia 20% for each Pyro, Electro, Cryo or Hydro member, two at most", () => {
    expect.hasAssertions();
    const navia = { ...createNaviaCombatant(), ascension: 4 };
    const bonusesOf = (elements: Element[]) =>
      NAVIA_KIT.getPassiveBonuses?.(navia, 1, [], elements.map(createNaviaTeamMember));
    expect(bonusesOf([Element.Pyro, Element.Anemo])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent },
    ]);
    expect(bonusesOf([Element.Pyro, Element.Electro, Element.Cryo, Element.Hydro])).toStrictEqual([
      { amount: 0.4, attribute: Attribute.AttackPercent },
    ]);
    expect(bonusesOf([Element.Anemo, Element.Geo])).toStrictEqual([]);
    expect(
      NAVIA_KIT.getPassiveBonuses?.(createNaviaCombatant(), 1, [], [createNaviaTeamMember(Element.Pyro)]),
    ).toStrictEqual([]);
  });
});
