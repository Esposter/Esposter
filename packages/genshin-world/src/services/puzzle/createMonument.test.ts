import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

import { Element } from "#src/models/Element";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { describe } from "vitest";

// A Pyro monument that is not timed and has no aura on it, lit or dark as given
export const createMonument = (isLit: boolean): ElementalMonument => ({
  element: Element.Pyro,
  elementalState: createElementalState(),
  isLit,
  isTimed: false,
  litSeconds: 0,
});

describe.todo("createMonument");
