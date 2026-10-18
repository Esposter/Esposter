import type { Reaction } from "#src/models/combat/Reaction";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import {
  applyCascadingShockwave,
  CASCADING_COOLDOWN_SECONDS,
} from "#src/services/spiralAbyss/blessings/cascadingBlessing";
import { describe, expect, test } from "vitest";

describe(applyCascadingShockwave, () => {
  const POSITION = { x: 1, z: 2 };

  test("a shockwave fires at an opponent's position for a Swirl of any element", () => {
    expect.hasAssertions();
    const swirls: Reaction[][] = [Element.Pyro, Element.Hydro, Element.Electro, Element.Cryo].map((element) => [
      { element, reactionType: ReactionType.Swirl },
    ]);

    for (const reactions of swirls)
      expect(applyCascadingShockwave(0, reactions, POSITION, 0).shockwavePosition).toStrictEqual(POSITION);
  });

  test("a shockwave does not fire for a reaction the blessing does not name", () => {
    expect.hasAssertions();

    expect(
      applyCascadingShockwave(0, [{ reactionType: ReactionType.Superconduct }], POSITION, 0).shockwavePosition,
    ).toBeUndefined();
    expect(
      applyCascadingShockwave(0, [{ reactionType: ReactionType.Shattered }], POSITION, 0).shockwavePosition,
    ).toBeUndefined();
    expect(
      applyCascadingShockwave(0, [{ reactionType: ReactionType.Overloaded }], POSITION, 0).shockwavePosition,
    ).toBeUndefined();
  });

  test("a shockwave fires at most once every 4 seconds", () => {
    expect.hasAssertions();
    const reactions: Reaction[] = [{ element: Element.Hydro, reactionType: ReactionType.Swirl }];

    const fired = applyCascadingShockwave(0, reactions, POSITION, 0);
    expect(fired.shockwavePosition).toStrictEqual(POSITION);
    expect(fired.readySeconds).toBe(CASCADING_COOLDOWN_SECONDS);

    const withinCooldown = applyCascadingShockwave(fired.readySeconds, reactions, POSITION, 3);
    expect(withinCooldown.shockwavePosition).toBeUndefined();
    expect(
      applyCascadingShockwave(withinCooldown.readySeconds, reactions, POSITION, 4).shockwavePosition,
    ).toStrictEqual(POSITION);
  });
});
