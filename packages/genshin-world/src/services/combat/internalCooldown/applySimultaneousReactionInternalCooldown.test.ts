import type { InternalCooldown } from "#src/models/combat/InternalCooldown";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { applySimultaneousReactionInternalCooldown } from "#src/services/combat/internalCooldown/applySimultaneousReactionInternalCooldown";
import { describe, expect, test } from "vitest";

describe(applySimultaneousReactionInternalCooldown, () => {
  test("lands a Swirl of one element once a tenth of a second, and another element's apart", () => {
    expect.hasAssertions();

    const internalCooldownMap = new Map<string, InternalCooldown>();
    const swirls: [Element, number][] = [
      [Element.Hydro, 0],
      [Element.Hydro, 0.05],
      [Element.Pyro, 0.05],
      [Element.Hydro, 0.1],
    ];
    const shares = swirls.map(([element, seconds]) =>
      applySimultaneousReactionInternalCooldown(
        internalCooldownMap,
        TransformativeReactionType.Swirl,
        element,
        seconds,
      ),
    );

    expect(shares).toStrictEqual([1, 0, 1, 1]);
  });

  test("lands every Electro-Charged", () => {
    expect.hasAssertions();

    const internalCooldownMap = new Map<string, InternalCooldown>();

    expect(
      [0, 0].map((seconds) =>
        applySimultaneousReactionInternalCooldown(
          internalCooldownMap,
          TransformativeReactionType.ElectroCharged,
          Element.Electro,
          seconds,
        ),
      ),
    ).toStrictEqual([1, 1]);
  });
});
