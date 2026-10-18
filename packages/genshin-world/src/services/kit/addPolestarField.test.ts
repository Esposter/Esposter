import type { Reaction } from "#src/models/combat/Reaction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { addPolestarField } from "#src/services/kit/addPolestarField";
import { ODETTE_CHARACTER_ID } from "#src/services/kit/characters/odetteKit";
import { describe, expect, test } from "vitest";

// Summarises each effect: a field by the fields a Polestar Field is read by, any other effect by its kind alone
const summarise = (kitEffectState: KitEffectState) =>
  kitEffectState.effects.map((effect) =>
    effect.kind === "field"
      ? {
          centre: effect.centre,
          characterId: effect.characterId,
          id: effect.id,
          radius: effect.radius,
          secondsRemaining: effect.secondsRemaining,
          tickIntervalSeconds: effect.tickIntervalSeconds,
        }
      : effect.kind,
  );

describe(addPolestarField, () => {
  const POSITION = { x: 3, z: 4 };
  const STELLAR_CONDUCT: Reaction = { element: Element.Cryo, reactionType: ReactionType.StellarConduct };

  test("a Stellar-Conduct places a Polestar Field round the point given for 7 seconds, ticking every 4", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    addPolestarField(kitEffectState, ODETTE_CHARACTER_ID, [STELLAR_CONDUCT], POSITION);

    expect(summarise(kitEffectState)).toStrictEqual([
      {
        centre: { x: 3, z: 4 },
        characterId: ODETTE_CHARACTER_ID,
        id: "polestar",
        radius: 15,
        secondsRemaining: 7,
        tickIntervalSeconds: 4,
      },
    ]);
  });

  test("any enabler's Stellar-Conduct places the field, so a second enabler needs no copy of its own", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    addPolestarField(kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], POSITION);

    expect(summarise(kitEffectState)).toStrictEqual([
      {
        centre: { x: 3, z: 4 },
        characterId: TRAVELER_CHARACTER_ID,
        id: "polestar",
        radius: 15,
        secondsRemaining: 7,
        tickIntervalSeconds: 4,
      },
    ]);
  });

  test("refreshes a standing Polestar Field rather than placing a second one", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    addPolestarField(kitEffectState, ODETTE_CHARACTER_ID, [STELLAR_CONDUCT], POSITION);
    for (const effect of kitEffectState.effects) if (effect.kind === "field") effect.secondsRemaining = 1;

    addPolestarField(kitEffectState, ODETTE_CHARACTER_ID, [STELLAR_CONDUCT], POSITION);

    expect(
      kitEffectState.effects.map((effect) => (effect.kind === "field" ? effect.secondsRemaining : effect.kind)),
    ).toStrictEqual([7]);
  });

  test("places nothing for a Stellar Swirl or any other reaction", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    addPolestarField(
      kitEffectState,
      ODETTE_CHARACTER_ID,
      [
        { element: Element.Electro, reactionType: ReactionType.Swirl },
        { element: Element.Cryo, reactionType: ReactionType.StellarSwirl },
        { element: Element.Cryo, reactionType: ReactionType.Melt },
      ],
      POSITION,
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
