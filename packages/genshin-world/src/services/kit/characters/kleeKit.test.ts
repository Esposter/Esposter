import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { KLEE_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKleeKit } from "#src/services/kit/characters/kleeKit";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KLEE_KIT = createKleeKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KLEE_CHARACTER_ID]));
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

const createKleeCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KLEE_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: KLEE_KIT,
  level: 90,
});

describe(createKleeKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createKleeCombatant(0);
    // The multipliers of the hits the summons an action's start casts land
    const readCastMultipliers = (action: KitAction): number[] => {
      const kitEffectState: KitEffectState = { effects: [] };
      action.onStart?.({ body: kitBody, combatant, kitEffectState });
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
      const context = {
        activeCombatant: combatant,
        body,
        party: createParty([KLEE_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
      };
      const offFieldContext = { ...context, activeCombatant: travelerCombatant };
      const kitEffectState: KitEffectState = { effects: [] };
      KLEE_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      const onFieldStrikes = stepKitEffects(kitEffectState, 4.5, context);
      const offFieldStrikes = [
        ...stepKitEffects(kitEffectState, 1, offFieldContext),
        ...stepKitEffects(kitEffectState, 1, offFieldContext),
      ];

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
      const combatant = createKleeCombatant(constellationCount);
      const context = {
        activeCombatant: combatant,
        body,
        party: createParty([KLEE_CHARACTER_ID, TRAVELER_CHARACTER_ID]),
      };
      const kitEffectState: KitEffectState = { effects: [] };
      KLEE_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      stepKitEffects(kitEffectState, 1 / 60, context);

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
});
