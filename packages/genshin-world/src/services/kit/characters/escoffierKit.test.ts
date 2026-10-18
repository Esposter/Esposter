import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createEscoffierKitBehaviour, ESCOFFIER_CHARACTER_ID } from "#src/services/kit/characters/escoffierKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
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
  describe("ascension 4's Hydro and Cryo RES shred", () => {
    // The RES Low-Temperature Cooking's first Frosty Parfait tick shreds from the enemy it hits, as the team stands
    const getShred = (ascension: number, deployedElements: (Element | undefined)[]): number | undefined => {
      const combatant = { ...createEscoffierCombatant(ascension), deployedElements };
      const kitEffectState: KitEffectState = { effects: [] };
      ESCOFFIER_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
      const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
      return summon?.hits[0]?.enemyStatus?.(combatant)?.resistanceReduction?.[Element.Cryo];
    };

    test("a passive takes effect at its ascension phase", () => {
      expect.hasAssertions();

      expect(getShred(4, [Element.Hydro, Element.Cryo, Element.Pyro, Element.Pyro])).toBeCloseTo(0.1);
    });

    test("a passive does not take effect below its ascension phase", () => {
      expect.hasAssertions();

      expect(getShred(3, [Element.Hydro, Element.Cryo, Element.Hydro, Element.Cryo])).toBeUndefined();
    });

    test("the shred steps up with each Hydro or Cryo member, to 55% for four", () => {
      expect.hasAssertions();

      expect(getShred(4, [Element.Hydro, Element.Cryo, Element.Hydro, Element.Cryo])).toBeCloseTo(0.55);
    });
  });
});

describe("escoffier kit constellation 1", () => {
  // The CRIT DMG a Cryo normal attack of hers gets from her constellation, on a team of the given elements
  const getCriticalDamageBonus = (
    constellationCount: number,
    deployedElements: Element[],
    hitElement = Element.Cryo,
  ): number => {
    const combatant: Combatant = { ...createEscoffierCombatant(0), constellationCount, deployedElements };
    const hit = { ...takeOne(takeOne(ESCOFFIER_KIT.normalAttacks).hits), element: hitElement };
    return (
      ESCOFFIER_KIT.getStrikeCriticalDamageBonus?.(
        { attackTag: AttackTag.NormalAttack, body: createKitTestContext(combatant).body, combatant, hit },
        createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        createParty([ESCOFFIER_CHARACTER_ID]),
        [],
      ) ?? 0
    );
  };

  test("adds 60% CRIT DMG to its own Cryo strike while the deployed team holds only Cryo and Hydro", () => {
    expect.hasAssertions();

    expect(getCriticalDamageBonus(1, [Element.Cryo, Element.Hydro])).toBe(0.6);
  });

  test("gives none while the deployed team holds another element", () => {
    expect.hasAssertions();

    expect(getCriticalDamageBonus(1, [Element.Cryo, Element.Electro])).toBe(0);
  });

  test("gives none to a strike of another element", () => {
    expect.hasAssertions();

    expect(getCriticalDamageBonus(1, [Element.Cryo, Element.Hydro], Element.Hydro)).toBe(0);
  });

  test("gives none below constellation 1", () => {
    expect.hasAssertions();

    expect(getCriticalDamageBonus(0, [Element.Cryo, Element.Hydro])).toBe(0);
  });
});
