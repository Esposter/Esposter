import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKleeKitBehaviour, KLEE_CHARACTER_ID } from "#src/services/kit/characters/kleeKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { endKitSwapEffects } from "#src/services/kit/effects/endKitSwapEffects";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KLEE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KLEE_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createKleeCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KLEE_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: KLEE_KIT,
  level: 90,
});

const statusIds = (effects: KitEffect[]): string[] =>
  effects.flatMap((effect) => (effect.kind === "status" ? [effect.id] : []));

describe(createKleeKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createKleeCombatant(0);
    // The multipliers of the hits the summons an action's start casts land
    const readCastMultipliers = (action: KitAction): number[] => {
      const kitEffectState: KitEffectState = { effects: [] };
      action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
      return kitEffectState.effects.flatMap((effect) =>
        effect.kind === "summon" ? effect.hits.map(({ talentMultiplier }) => talentMultiplier) : [],
      );
    };
    const multipliers = [
      ...KLEE_KIT.normalAttacks.flatMap((action) => readCastMultipliers(action)),
      ...readCastMultipliers(KLEE_KIT.chargedAttack),
      KLEE_KIT.plungeCollision.talentMultiplier,
      takeOne(KLEE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(KLEE_KIT.highPlunge.hits).talentMultiplier,
      ...readCastMultipliers(KLEE_KIT.elementalSkill),
      takeOne(readCastMultipliers(KLEE_KIT.elementalBurst)),
    ];
    const expectedMultipliers = [
      0.7216, 0.624, 0.8992, 1.5736, 0.5683, 1.1363, 1.4193, 0.952, 0.952, 0.952, 0.328, 0.328, 0.4264,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test.each([
    [0, []],
    [4, [5.55]],
  ])(
    "at %i constellations, Sparks 'n' Splash lands a wave's three sparks and ends as Klee leaves the field, in explosions of %j",
    (constellationCount, explosionMultipliers) => {
      expect.hasAssertions();
      const combatant = createKleeCombatant(constellationCount);
      const travelerCombatant: Combatant = { ...combatant, characterId: TRAVELER_CHARACTER_ID, kit: TRAVELER_KIT };
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(combatant, {
        kitEffectState,
        party: createParty([KLEE_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
      });
      const offFieldContext = { ...context, activeCombatant: travelerCombatant };
      KLEE_KIT.elementalBurst.onStart?.(context);
      const onFieldStrikes = stepKitTestEffects(4.5, context);
      // The swap to the Traveler ends what Klee's leaving ends, and her kit hears it, as stepActiveKit does on a swap
      endKitSwapEffects(kitEffectState.effects, KLEE_CHARACTER_ID);
      KLEE_KIT.onKitEvent?.(
        {
          characterId: TRAVELER_CHARACTER_ID,
          kind: KitEventKind.CharacterSwapped,
          previousCharacterId: KLEE_CHARACTER_ID,
        },
        offFieldContext,
        combatant,
      );
      const offFieldStrikes = [...stepKitTestEffects(1, offFieldContext), ...stepKitTestEffects(1, offFieldContext)];

      expect(onFieldStrikes).toHaveLength(3);
      expect(offFieldStrikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual(explosionMultipliers);
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test.each([
    [5, []],
    [6, [KLEE_CHARACTER_ID, TRAVELER_CHARACTER_ID]],
  ])(
    "at %i constellations, Sparks 'n' Splash gives Blazing Delight's 10%% Pyro DMG Bonus for 25 seconds to %j",
    (constellationCount, characterIds) => {
      expect.hasAssertions();
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(createKleeCombatant(constellationCount), {
        kitEffectState,
        party: createParty([KLEE_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
      });
      KLEE_KIT.elementalBurst.onStart?.(context);
      stepKitEffects(1 / 60, context);

      expect(kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual(
        characterIds.map((characterId) => ({
          amount: 0.1,
          attribute: Attribute.PyroDamageBonus,
          characterId,
          kind: "buff",
          secondsRemaining: 25,
          source: "Blazing Delight",
        })),
      );
    },
  );

  test("klee's Sparks 'n' Splash ends when Klee is swapped off the field", () => {
    expect.hasAssertions();
    const combatant = createKleeCombatant(0);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    KLEE_KIT.elementalBurst.onStart?.(context);
    const standing = kitEffectState.effects.length;
    endKitSwapEffects(kitEffectState.effects, KLEE_CHARACTER_ID);
    stepKitTestEffects(0.1, context);

    expect([standing > 0, kitEffectState.effects]).toStrictEqual([true, []]);
  });

  test("klee's Explosive Spark is applied at a 50% chance on a hit", () => {
    expect.hasAssertions();
    const combatant = { ...createKleeCombatant(0), ascension: 1 };
    const rollBombHit = (random: number): KitEffect[] => {
      const kitEffectState = castKitAction(takeOne(KLEE_KIT.normalAttacks, 0), combatant);
      const summon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
      const [bombHit] = summon?.hits ?? [];
      const context = createKitTestContext(combatant, { kitEffectState, random: () => random });
      bombHit?.onStrike?.(context, { body: context.body, combatant, hit: bombHit });
      return kitEffectState.effects;
    };

    expect(statusIds(rollBombHit(0.49))).toStrictEqual(["klee-explosive-spark-cooldown", "klee-explosive-spark"]);
    expect(statusIds(rollBombHit(0.5))).toStrictEqual([]);
  });

  test("klee's charged attack spends a standing Explosive Spark for no stamina and 50% more Pyro DMG", () => {
    expect.hasAssertions();
    const combatant = { ...createKleeCombatant(0), ascension: 1 };
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: KLEE_CHARACTER_ID, id: "klee-explosive-spark", kind: "status", secondsRemaining: 30 }],
    };
    const multiplier = KLEE_KIT.getChargedAttackStaminaMultiplier?.(
      createKitTestContext(combatant, { kitEffectState }),
    );
    castKitAction(KLEE_KIT.chargedAttack, combatant, kitEffectState);
    const pyroBonus = kitEffectState.effects.flatMap((effect) =>
      effect.kind === "buff" && effect.attribute === Attribute.PyroDamageBonus ? [effect.amount] : [],
    );

    expect([multiplier, pyroBonus, kitEffectState.effects.some((effect) => effect.kind === "status")]).toStrictEqual([
      0,
      [0.5],
      false,
    ]);
  });
});
