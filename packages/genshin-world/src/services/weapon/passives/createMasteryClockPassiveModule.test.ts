import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createMasteryClockPassiveModule } from "#src/services/weapon/passives/createMasteryClockPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

// The buff a character has on the team's effects, if it has one
const findBuff = (context: KitContext, characterId: number): KitBuff | undefined =>
  context.kitEffectState.effects.find(
    (effect): effect is KitBuff => effect.kind === "buff" && effect.characterId === characterId,
  );

describe(createMasteryClockPassiveModule, () => {
  const wielder = createWielderCombatant([{ attribute: Attribute.ElementalMastery, value: 100 }]);
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  const createContext = (activeCombatant = wielder): KitContext =>
    createKitTestContext(wielder, {
      activeCombatant,
      characterIdCombatantMap: new Map([
        [OTHER_CHARACTER_ID, other],
        [TRAVELER_CHARACTER_ID, wielder],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
  // The given seconds stepped through the team's effects and then the passive's own clock, as the world steps them
  const stepSeconds = (context: KitContext, passiveModule: PassiveModule, seconds: number) => {
    for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
      stepKitSeconds(context, FIXED_STEP_SECONDS);
      passiveModule.onStep?.(context, wielder, FIXED_STEP_SECONDS);
    }
  };

  // Jinni's Whisper at its first rank: every ten seconds, 0.036% Energy Recharge for each point of Elemental Mastery
  // For Twelve seconds, a nearby member 30% of it. The rows hold the rate as the percentage its text gives, scaled to a
  // Fraction
  const jinnisWhisper = createMasteryClockPassiveModule([10, 0.036, 12, 0.3], {
    attribute: Attribute.EnergyRecharge,
    valueScale: 0.01,
  });

  test("each tick gives the wielder its Elemental Mastery's share as Energy Recharge, and a nearby member the rank's share of it", () => {
    expect.hasAssertions();

    const context = createContext();
    stepSeconds(context, jinnisWhisper, 10.5);

    expect(findBuff(context, TRAVELER_CHARACTER_ID)?.amount).toBeCloseTo(0.036);
    expect(findBuff(context, OTHER_CHARACTER_ID)?.amount).toBeCloseTo(0.0108);
  });

  test("a tick refreshes the buff rather than stacking it, restarting the rank's seconds", () => {
    expect.hasAssertions();

    const context = createContext();
    stepSeconds(context, jinnisWhisper, 20.5);

    expect(context.kitEffectState.effects.filter((effect) => effect.kind === "buff")).toHaveLength(2);
    // Twelve seconds, less the 29 sixtieths of a second run since the tick at about twenty seconds
    expect(findBuff(context, TRAVELER_CHARACTER_ID)?.secondsRemaining).toBeCloseTo(11.5167);
  });

  test("the clock runs off the field, and a raised rank reads its own rate", () => {
    expect.hasAssertions();

    // Jinni's Whisper at its fifth rank, 0.072%, with the other member on the field
    const jinnisWhisperFifthRank = createMasteryClockPassiveModule([10, 0.072, 12, 0.3], {
      attribute: Attribute.EnergyRecharge,
      valueScale: 0.01,
    });
    const context = createContext(other);
    stepSeconds(context, jinnisWhisperFifthRank, 10.5);

    expect(findBuff(context, TRAVELER_CHARACTER_ID)?.amount).toBeCloseTo(0.072);
  });

  test("a rank that gives flat ATK takes its share of Elemental Mastery as ATK, as Desert Pavilion does", () => {
    expect.hasAssertions();

    // Desert Pavilion at its first rank: 24% of Elemental Mastery as ATK, every ten seconds
    const desertPavilion = createMasteryClockPassiveModule([10, 0.24, 12, 0.3], {
      attribute: Attribute.Attack,
      valueScale: 1,
    });
    const context = createContext();
    stepSeconds(context, desertPavilion, 10.5);

    expect(findBuff(context, TRAVELER_CHARACTER_ID)?.attribute).toBe(Attribute.Attack);
    expect(findBuff(context, TRAVELER_CHARACTER_ID)?.amount).toBeCloseTo(24);
  });
});
