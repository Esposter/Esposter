import type { Reaction } from "#src/models/combat/Reaction";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import {
  applyStardreadShockwave,
  STARDREAD_COOLDOWN_SECONDS,
} from "#src/services/spiralAbyss/blessings/stardreadBlessing";
import { describe, expect, test } from "vitest";

describe(applyStardreadShockwave, () => {
  const POSITION = { x: 1, z: 2 };

  test("a shockwave fires at an opponent's position for each reaction the blessing names", () => {
    expect.hasAssertions();
    const namedReactions: Reaction[][] = [
      [{ reactionType: ReactionType.Superconduct }],
      [{ element: Element.Cryo, reactionType: ReactionType.Swirl }],
      [{ reactionType: ReactionType.Frozen }],
      [{ reactionType: ReactionType.Shattered }],
    ];

    for (const reactions of namedReactions)
      expect(applyStardreadShockwave(0, reactions, POSITION, 0).shockwavePosition).toStrictEqual(POSITION);
  });

  test("a shockwave does not fire for a reaction the blessing does not name", () => {
    expect.hasAssertions();

    expect(
      applyStardreadShockwave(0, [{ element: Element.Pyro, reactionType: ReactionType.Swirl }], POSITION, 0)
        .shockwavePosition,
    ).toBeUndefined();
    expect(
      applyStardreadShockwave(0, [{ reactionType: ReactionType.Overloaded }], POSITION, 0).shockwavePosition,
    ).toBeUndefined();
  });

  test("a shockwave fires at most once every 2 seconds", () => {
    expect.hasAssertions();
    const reactions: Reaction[] = [{ reactionType: ReactionType.Frozen }];

    const fired = applyStardreadShockwave(0, reactions, POSITION, 0);
    expect(fired.shockwavePosition).toStrictEqual(POSITION);
    expect(fired.readySeconds).toBe(STARDREAD_COOLDOWN_SECONDS);

    const withinCooldown = applyStardreadShockwave(fired.readySeconds, reactions, POSITION, 1);
    expect(withinCooldown.shockwavePosition).toBeUndefined();
    expect(
      applyStardreadShockwave(withinCooldown.readySeconds, reactions, POSITION, 2).shockwavePosition,
    ).toStrictEqual(POSITION);
  });
});
