import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createHeizouKitBehaviour, HEIZOU_CHARACTER_ID } from "#src/services/kit/characters/heizouKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const HEIZOU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, HEIZOU_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createHeizouCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 100 }]),
  characterId: HEIZOU_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Anemo,
  elementalResonances: [],
  kit: HEIZOU_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

describe(createHeizouKitBehaviour, () => {
  test("the strikes, the fourth's three hits, the charged attack and the plunges read their table indexes at talent level 1", () => {
    expect.hasAssertions();
    const normalAttackMultipliers = HEIZOU_KIT.normalAttacks.map(({ hits }) =>
      hits.map(({ talentMultiplier }) => talentMultiplier),
    );

    expect(normalAttackMultipliers).toStrictEqual([
      [0.374736],
      [0.36852],
      [0.5106],
      [0.147824, 0.162608, 0.192176],
      [0.614496],
    ]);
    expect(HEIZOU_KIT.chargedAttack.hits[0]?.talentMultiplier).toBe(0.73);
    expect(HEIZOU_KIT.chargedAttackStamina).toBe(25);
    expect(HEIZOU_KIT.plungeCollision.talentMultiplier).toBe(0.568288);
    expect(HEIZOU_KIT.lowPlunge.hits[0]?.talentMultiplier).toBe(1.136335);
    expect(HEIZOU_KIT.highPlunge.hits[0]?.talentMultiplier).toBe(1.419344);
  });

  test("the full hold strikes with four Declension stacks and its Conviction bonus, from three seconds", () => {
    expect.hasAssertions();
    const [hold] = HEIZOU_KIT.elementalSkillHolds ?? [];

    expect(hold?.minimumHeldSeconds).toBe(3);
    expect(hold?.action.hits[0]?.talentMultiplier).toBeCloseTo(2.2752 + 4 * 0.5688 + 1.1376, 10);
    expect(HEIZOU_KIT.elementalSkill.hits[0]?.talentMultiplier).toBe(2.2752);
  });

  test("every hit of his deals Anemo, 2U from the skill, 1U from the rest and none from the plunge collision", () => {
    expect.hasAssertions();
    const oneUnitHits: KitHit[] = [
      ...HEIZOU_KIT.normalAttacks.flatMap(({ hits }) => hits),
      ...HEIZOU_KIT.chargedAttack.hits,
      ...HEIZOU_KIT.lowPlunge.hits,
      ...HEIZOU_KIT.highPlunge.hits,
      ...HEIZOU_KIT.elementalBurst.hits.slice(1),
    ];

    expect(new Set(oneUnitHits.map(({ element, gauge }) => `${element} ${gauge}`))).toStrictEqual(
      new Set([`${Element.Anemo} 1`]),
    );
    expect(HEIZOU_KIT.elementalSkill.hits.map(({ element, gauge }) => [element, gauge])).toStrictEqual([
      [Element.Anemo, 2],
    ]);
    expect([HEIZOU_KIT.plungeCollision.element, HEIZOU_KIT.plungeCollision.gauge]).toStrictEqual([
      Element.Anemo,
      undefined,
    ]);
  });

  test("the burst's Windmuster Iris explodes 40 frames on where an enemy the burst tags stands, in the first aura it holds, for 4 at most", () => {
    expect.hasAssertions();
    const combatant = createHeizouCombatant();
    const context = createKitTestContext(combatant);
    HEIZOU_KIT.elementalBurst.onStart?.(context);
    const auraElements = [[Element.Electro, Element.Hydro], [], [Element.Pyro], [Element.Cryo], [Element.Pyro]];
    for (const elements of auraElements) {
      const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
      for (const element of elements) applyElement(enemy.elementalState, element, 1);
      HEIZOU_KIT.onKitEvent?.(
        {
          attackTag: AttackTag.ElementalBurst,
          enemy,
          hit: takeOne(HEIZOU_KIT.elementalBurst.hits),
          isCritical: false,
          isDefeated: false,
          kind: KitEventKind.DamageTaken,
          striker: combatant,
        },
        context,
        combatant,
      );
    }

    expect(
      context.kitEffectState.effects.flatMap((effect) =>
        effect.kind === "summon"
          ? effect.hits.map(({ element, hitmarkSeconds, talentMultiplier }) => [
              element,
              hitmarkSeconds,
              talentMultiplier,
            ])
          : [],
      ),
    ).toStrictEqual([
      [Element.Hydro, 40 / 60, 0.21456],
      [Element.Pyro, 40 / 60, 0.21456],
      [Element.Cryo, 40 / 60, 0.21456],
    ]);
  });

  test("the skill, burst and burst's energy read their cooldowns and cost from the proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: HEIZOU_KIT.burstCooldownSeconds,
      burstEnergyCost: HEIZOU_KIT.burstEnergyCost,
      skillCooldownSeconds: HEIZOU_KIT.skillCooldownSeconds,
    }).toStrictEqual({ burstCooldownSeconds: 12, burstEnergyCost: 40, skillCooldownSeconds: 10 });
  });
});

describe("penetrative reasoning", () => {
  const TEAMMATE_CHARACTER_ID = 1;

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createHeizouCombatant(), ascension: 4 };
    const context = createKitTestContext(combatant, {
      party: createParty([HEIZOU_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });

    takeOne(HEIZOU_KIT.elementalSkill.hits).onStrike?.(context, {
      body: context.body,
      combatant,
      hit: takeOne(HEIZOU_KIT.elementalSkill.hits),
    });

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 80,
        attribute: Attribute.ElementalMastery,
        characterId: TEAMMATE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "heizou-a4",
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createHeizouCombatant(), ascension: 3 };
    const context = createKitTestContext(combatant, {
      party: createParty([HEIZOU_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });

    takeOne(HEIZOU_KIT.elementalSkill.hits).onStrike?.(context, {
      body: context.body,
      combatant,
      hit: takeOne(HEIZOU_KIT.elementalSkill.hits),
    });

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
