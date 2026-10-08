import type { GcgRule } from "#src/models/gcg/GcgRule";

import { Element } from "#src/models/Element";
import { GcgReactionKind } from "#src/models/gcg/GcgReactionKind";
import { getGcgReactionKind } from "#src/services/gcg/getGcgReactionKind";
import { describe, expect, test } from "vitest";

describe(getGcgReactionKind, () => {
  const rule: GcgRule = {
    drawCount: 2,
    handCardLimit: 10,
    reactions: [
      { elements: [Element.Cryo, Element.Pyro], id: 101 },
      { elements: [Element.Anemo, Element.Pyro], id: 109 },
    ],
  };

  test("should name the reaction a listed pair makes, whichever element comes first", () => {
    expect.hasAssertions();

    expect({
      anemoPyro: getGcgReactionKind(rule, Element.Anemo, Element.Pyro),
      pyroAnemo: getGcgReactionKind(rule, Element.Pyro, Element.Anemo),
      pyroCryo: getGcgReactionKind(rule, Element.Pyro, Element.Cryo),
    }).toStrictEqual({
      anemoPyro: GcgReactionKind.Swirl,
      pyroAnemo: GcgReactionKind.Swirl,
      pyroCryo: GcgReactionKind.Melt,
    });
  });

  test("should name no reaction for a pair the rule does not list", () => {
    expect.hasAssertions();

    expect(getGcgReactionKind(rule, Element.Hydro, Element.Pyro)).toBeUndefined();
  });
});
