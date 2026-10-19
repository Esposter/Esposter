import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createEscoffierKitBehaviour, ESCOFFIER_CHARACTER_ID } from "#src/services/kit/characters/escoffierKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ESCOFFIER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ESCOFFIER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createEscoffierCombatant = (ascension: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([]),
  characterId: ESCOFFIER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ESCOFFIER_KIT,
  level: 90,
});

// The ids of the fields Scoring Cuts leaves going, at the ascension
const castScoringCutsFieldIds = (ascension: number): (string | undefined)[] => {
  const context = createKitTestContext(createEscoffierCombatant(ascension));
  ESCOFFIER_KIT.elementalBurst.onStart?.(context);
  return context.kitEffectState.effects.flatMap((effect) => (effect.kind === "field" ? [effect.id] : []));
};

// The RES Low-Temperature Cooking's first Frosty Parfait tick shreds from the enemy it hits, as the team stands
const getShred = (ascension: number, deployedElements: (Element | undefined)[]): number | undefined => {
  const combatant = { ...createEscoffierCombatant(ascension), deployedElements };
  const kitEffectState: KitEffectState = { effects: [] };
  ESCOFFIER_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
  return summon?.hits[0]?.enemyStatus?.(combatant)?.resistanceReduction?.[Element.Cryo];
};

const createTeamCombatant = (
  ascension: number,
  constellationCount: number,
  deployedElements: Element[],
): Combatant => ({ ...createEscoffierCombatant(ascension), constellationCount, deployedElements });

// A normal attack's first hit, of the element given
const readNormalAttackHit = (element: Element): KitHit => ({
  ...takeOne(takeOne(ESCOFFIER_KIT.normalAttacks).hits),
  element,
});

// The CRIT DMG her kit adds to a strike of her own, read as the context stands after her skill
const readOwnCriticalDamageBonus = (context: KitContext, element: Element): number =>
  ESCOFFIER_KIT.getStrikeCriticalDamageBonus?.(
    {
      attackTag: AttackTag.NormalAttack,
      body: context.body,
      combatant: context.activeCombatant,
      hit: readNormalAttackHit(element),
    },
    createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    context.party,
    context.kitEffectState.effects,
  ) ?? 0;

describe(createEscoffierKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...ESCOFFIER_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...ESCOFFIER_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      ESCOFFIER_KIT.plungeCollision.talentMultiplier,
      takeOne(ESCOFFIER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ESCOFFIER_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.51551, 0.475933, 0.329995, 0.403327, 1.15412, 0.639324, 1.278377, 1.596762]);
  });

  test("the normal attack's hits land at their hitmarks, and the third strike has two", () => {
    expect.hasAssertions();
    expect(
      ESCOFFIER_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[7], [16], [27, 40]]);
    expect(ESCOFFIER_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([22, 30, 62]);
  });

  test("the charged attack hits at 20 frames of a 65-frame animation, costing 25 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(ESCOFFIER_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(20);
    expect(Math.round(ESCOFFIER_KIT.chargedAttack.seconds * 60)).toBe(65);
    expect(ESCOFFIER_KIT.chargedAttackStamina).toBe(25);
  });

  test("the skill cools for 15 seconds, and the burst costs 60 energy for 15 seconds", () => {
    expect.hasAssertions();
    expect(ESCOFFIER_KIT.skillCooldownSeconds).toBe(15);
    expect(ESCOFFIER_KIT.burstCooldownSeconds).toBe(15);
    expect(ESCOFFIER_KIT.burstEnergyCost).toBe(60);
  });

  test("the low plunge lands at 41 frames and the high plunge at 43, with their gcsim poise", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(ESCOFFIER_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(41);
    expect(takeOne(ESCOFFIER_KIT.lowPlunge.hits).poiseDamage).toBe(100);
    expect(Math.round(takeOne(ESCOFFIER_KIT.highPlunge.hits).hitmarkSeconds * 60)).toBe(43);
    expect(takeOne(ESCOFFIER_KIT.highPlunge.hits).poiseDamage).toBe(150);
  });

  test("the Ascension 1 passive, Better to Salivate Than Medicate, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castScoringCutsFieldIds(1)).toStrictEqual(["escoffier-scoring-cuts-heal", "escoffier-rehab-diet"]);
  });

  test("the Ascension 1 passive, Better to Salivate Than Medicate, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castScoringCutsFieldIds(0)).toStrictEqual(["escoffier-scoring-cuts-heal"]);
  });

  test("ascension 4's Hydro and Cryo RES shred takes effect as a passive at its ascension phase", () => {
    expect.hasAssertions();

    expect(getShred(4, [Element.Hydro, Element.Cryo, Element.Pyro, Element.Pyro])).toBeCloseTo(0.1);
  });

  test("ascension 4's Hydro and Cryo RES shred does not take effect as a passive below its ascension phase", () => {
    expect.hasAssertions();

    expect(getShred(3, [Element.Hydro, Element.Cryo, Element.Hydro, Element.Cryo])).toBeUndefined();
  });

  test("ascension 4's Hydro and Cryo RES shred steps up with each Hydro or Cryo member, to 55% for four", () => {
    expect.hasAssertions();

    expect(getShred(4, [Element.Hydro, Element.Cryo, Element.Hydro, Element.Cryo])).toBeCloseTo(0.55);
  });
});

describe("escoffier kit constellation 1", () => {
  const TEAMMATE_CHARACTER_ID = 10_000_001;
  const CRYO_HYDRO_TEAM = [Element.Cryo, Element.Hydro];
  const CONSTELLATION_1_BONUS = 0.6;

  // The CRIT DMG her kit adds to a strike of a teammate's, of the element given, read once her skill is pressed
  const readTeammateCriticalDamageBonus = (combatant: Combatant, element: Element): number => {
    const context = createKitTestContext(combatant);
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);
    return (
      ESCOFFIER_KIT.getPartyStrikeBonus?.(
        combatant,
        {
          attackTag: AttackTag.NormalAttack,
          body: context.body,
          combatant: { ...createEscoffierCombatant(0), characterId: TEAMMATE_CHARACTER_ID },
          hit: readNormalAttackHit(element),
        },
        createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      )?.criticalDamageBonus ?? 0
    );
  };

  test("a constellation's CRIT DMG takes effect at its constellation phase", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTeamCombatant(4, 1, CRYO_HYDRO_TEAM));
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);

    expect(readOwnCriticalDamageBonus(context, Element.Cryo)).toBe(CONSTELLATION_1_BONUS);
  });

  test("a constellation's CRIT DMG does not take effect below its constellation phase", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTeamCombatant(4, 0, CRYO_HYDRO_TEAM));
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);

    expect(readOwnCriticalDamageBonus(context, Element.Cryo)).toBe(0);
  });

  test("a constellation's CRIT DMG does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTeamCombatant(3, 1, CRYO_HYDRO_TEAM));
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);

    expect(readOwnCriticalDamageBonus(context, Element.Cryo)).toBe(0);
  });

  test("a constellation's CRIT DMG does not take effect while the deployed team holds another element", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTeamCombatant(4, 1, [Element.Cryo, Element.Electro]));
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);

    expect(readOwnCriticalDamageBonus(context, Element.Cryo)).toBe(0);
  });

  test("a constellation's CRIT DMG does not take effect on her own strike of another element", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTeamCombatant(4, 1, CRYO_HYDRO_TEAM));
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);

    expect(readOwnCriticalDamageBonus(context, Element.Hydro)).toBe(0);
  });

  test("a constellation's CRIT DMG lasts 15 seconds from her skill", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createTeamCombatant(4, 1, CRYO_HYDRO_TEAM));
    ESCOFFIER_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 14);
    expect(readOwnCriticalDamageBonus(context, Element.Cryo)).toBe(CONSTELLATION_1_BONUS);
    stepKitSeconds(context, 2);
    expect(readOwnCriticalDamageBonus(context, Element.Cryo)).toBe(0);
  });

  test("a constellation's CRIT DMG reaches a teammate's Cryo strike", () => {
    expect.hasAssertions();

    expect(readTeammateCriticalDamageBonus(createTeamCombatant(4, 1, CRYO_HYDRO_TEAM), Element.Cryo)).toBe(
      CONSTELLATION_1_BONUS,
    );
  });

  test("a constellation's CRIT DMG does not reach a teammate's strike of another element", () => {
    expect.hasAssertions();

    expect(readTeammateCriticalDamageBonus(createTeamCombatant(4, 1, CRYO_HYDRO_TEAM), Element.Hydro)).toBe(0);
  });
});
