import type { InternalCooldown } from "#src/models/combat/InternalCooldown";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { applyReactionInternalCooldown } from "#src/services/combat/internalCooldown/applyReactionInternalCooldown";
import { describe, expect, test } from "vitest";

describe(applyReactionInternalCooldown, () => {
  test.each([
    [TransformativeReactionType.Swirl, Element.Hydro, [1, 1, 0, 1]],
    [TransformativeReactionType.Shattered, undefined, [1, 1, 0, 1]],
    [TransformativeReactionType.ElectroCharged, Element.Electro, [1, 0, 0, 1]],
    [TransformativeReactionType.Burning, Element.Pyro, [1, 1, 1, 1]],
  ])(
    "deals one source's %s %s the shares of its half second's sequence, at 0, 0.2, 0.3 and 0.5 seconds",
    (transformativeReactionType, element, shares) => {
      expect.hasAssertions();

      const internalCooldownMap = new Map<string, InternalCooldown>();

      expect(
        [0, 0.2, 0.3, 0.5].map((seconds) =>
          applyReactionInternalCooldown(internalCooldownMap, 1, transformativeReactionType, element, seconds),
        ),
      ).toStrictEqual(shares);
    },
  );

  test("lands a Swirl of one element once a tenth of a second whatever its source, and another element's apart", () => {
    expect.hasAssertions();

    const internalCooldownMap = new Map<string, InternalCooldown>();
    const shares = [
      applyReactionInternalCooldown(internalCooldownMap, 1, TransformativeReactionType.Swirl, Element.Hydro, 0),
      applyReactionInternalCooldown(internalCooldownMap, 2, TransformativeReactionType.Swirl, Element.Hydro, 0.05),
      applyReactionInternalCooldown(internalCooldownMap, 2, TransformativeReactionType.Swirl, Element.Pyro, 0.05),
      applyReactionInternalCooldown(internalCooldownMap, 2, TransformativeReactionType.Swirl, Element.Hydro, 0.1),
    ];

    expect(shares).toStrictEqual([1, 0, 1, 1]);
  });
});
