import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createNeuvilletteKitBehaviour, NEUVILLETTE_CHARACTER_ID } from "#src/services/kit/characters/neuvilletteKit";
import { SOURCEWATER_DROPLET_FIELD_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NEUVILLETTE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEUVILLETTE_CHARACTER_ID);

// The passive bonuses a combatant gets at an ascension phase and HP share, each as its attribute and amount to a thousandth
const getPassiveBonusPairs = (ascension: number, healthShare: number): [Attribute, number][] =>
  (
    createNeuvilletteKitBehaviour({ kit: NEUVILLETTE_KIT, readHits: () => [] }).getPassiveBonuses?.(
      {
        ascension,
        attributes: computeCharacterAttributes([]),
        characterId: NEUVILLETTE_CHARACTER_ID,
        constellationCount: 0,
        elementalResonances: [],
        kit: NEUVILLETTE_KIT,
        level: 90,
      },
      healthShare,
      [],
      [],
    ) ?? []
  ).map(({ amount, attribute }) => [attribute, Math.round(amount * 1000) / 1000]);

describe(createNeuvilletteKitBehaviour, () => {
  test("reads the strikes', plunges' and Spiritbreath Thorn's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NEUVILLETTE_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      NEUVILLETTE_KIT.plungeCollision.talentMultiplier,
      NEUVILLETTE_KIT.lowPlunge.hits[0]?.talentMultiplier,
      NEUVILLETTE_KIT.highPlunge.hits[0]?.talentMultiplier,
      NEUVILLETTE_KIT.elementalSkill.hits[1]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.545768, 0.462456, 0.723376, 0.568288, 1.136335, 1.419344, 0.208]);
  });

  test("the charged attack costs no stamina, his burst costs 70 energy and cools for 18 seconds, and his skill cools for 12 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NEUVILLETTE_KIT.burstCooldownSeconds,
      burstEnergyCost: NEUVILLETTE_KIT.burstEnergyCost,
      chargedAttackStamina: NEUVILLETTE_KIT.chargedAttackStamina,
      skillCooldownSeconds: NEUVILLETTE_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 0,
      skillCooldownSeconds: 12,
    });
  });

  test("his strikes deal hydro, and his skill's and burst's hits land at their hitmarks, past their animations too", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: NEUVILLETTE_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackElements: NEUVILLETTE_KIT.normalAttacks.map(({ hits }) => hits[0]?.element),
      skillHitmarkFrames: NEUVILLETTE_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
    }).toStrictEqual({
      burstHitmarkFrames: [95, 135, 154],
      normalAttackElements: [Element.Hydro, Element.Hydro, Element.Hydro],
      skillHitmarkFrames: [23, 60],
    });
  });

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    expect(getPassiveBonusPairs(4, 0.5)).toStrictEqual([[Attribute.HydroDamageBonus, 0.12]]);
    expect(getPassiveBonusPairs(4, 1)).toStrictEqual([[Attribute.HydroDamageBonus, 0.3]]);
  });

  test("reads the judgement's waves as its kit is built, so a record without them fails at build", () => {
    expect.hasAssertions();

    expect(() =>
      createNeuvilletteKitBehaviour({
        kit: NEUVILLETTE_KIT,
        readHits: () => {
          throw new InvalidOperationError(Operation.Read, "hits.judgement", "is not a hit of the record");
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: hits.judgement, is not a hit of the record]`,
    );
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    expect(getPassiveBonusPairs(3, 0.5)).toStrictEqual([]);
  });
});

describe("the burst's droplets", () => {
  test("spawns three, two and one droplets at its ticks, 95, 135 and 154 frames in", () => {
    expect.hasAssertions();

    const combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: NEUVILLETTE_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: NEUVILLETTE_KIT,
      level: 90,
    };
    const context = createKitTestContext(combatant);
    createNeuvilletteKitBehaviour({ kit: NEUVILLETTE_KIT, readHits: () => [] }).burst?.onStart?.(context);
    const dropletCounts: number[] = [];
    for (let frame = 1; frame <= 154; frame++) {
      stepKitSeconds(context, FIXED_STEP_SECONDS);
      dropletCounts.push(
        context.kitEffectState.effects.filter(
          (effect) =>
            effect.kind === "field" && effect.id === SOURCEWATER_DROPLET_FIELD_ID && effect.secondsRemaining > 0,
        ).length,
      );
    }
    // No droplet until the first tick at frame 95, then three to frame 134, five to frame 153 and six on the last frame
    expect(dropletCounts).toStrictEqual([
      ...Array.from({ length: 94 }, () => 0),
      ...Array.from({ length: 40 }, () => 3),
      ...Array.from({ length: 19 }, () => 5),
      6,
    ]);
  });
});

const createNeuvilletteCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: NEUVILLETTE_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: NEUVILLETTE_KIT,
  level: 90,
});

// Neuvillette healed by a fifth of his Max HP
const createHealEvent = (): KitHealthChangedEvent => ({
  bondOfLifeShare: 0,
  characterId: NEUVILLETTE_CHARACTER_ID,
  healthShare: 0.2,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
});

const countDroplets = (context: KitContext): number =>
  context.kitEffectState.effects.filter(
    (effect) => effect.kind === "field" && effect.id === SOURCEWATER_DROPLET_FIELD_ID && effect.secondsRemaining > 0,
  ).length;

describe("constellation 4's droplet on a heal", () => {
  test("spawns a droplet when he is healed on the field, then waits 4 seconds before the next", () => {
    expect.hasAssertions();
    const combatant = createNeuvilletteCombatant(4);
    const context = createKitTestContext(combatant);
    const behaviour = createNeuvilletteKitBehaviour({ kit: NEUVILLETTE_KIT, readHits: () => [] });
    behaviour.onKitEvent?.(createHealEvent(), context, combatant);
    expect(countDroplets(context)).toBe(1);
    behaviour.onKitEvent?.(createHealEvent(), context, combatant);
    expect(countDroplets(context)).toBe(1);
    stepKitSeconds(context, 4.1);
    behaviour.onKitEvent?.(createHealEvent(), context, combatant);
    expect(countDroplets(context)).toBe(2);
  });

  test("spawns no droplet below constellation 4", () => {
    expect.hasAssertions();
    const combatant = createNeuvilletteCombatant(3);
    const context = createKitTestContext(combatant);
    createNeuvilletteKitBehaviour({ kit: NEUVILLETTE_KIT, readHits: () => [] }).onKitEvent?.(
      createHealEvent(),
      context,
      combatant,
    );
    expect(countDroplets(context)).toBe(0);
  });

  test("spawns no droplet while another member is on the field", () => {
    expect.hasAssertions();
    const combatant = createNeuvilletteCombatant(4);
    const otherCombatant = { ...createNeuvilletteCombatant(0), characterId: 10_000_049 };
    const context = { ...createKitTestContext(combatant), activeCombatant: otherCombatant };
    createNeuvilletteKitBehaviour({ kit: NEUVILLETTE_KIT, readHits: () => [] }).onKitEvent?.(
      createHealEvent(),
      context,
      combatant,
    );
    expect(countDroplets(context)).toBe(0);
  });
});
