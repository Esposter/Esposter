import type { CraftingBenchPlace } from "#src/models/crafting/CraftingBenchPlace";

import { computeCraftingBenchInteractables } from "#src/services/crafting/computeCraftingBenchInteractables";
import { CRAFTING_BENCH_INTERACTABLE_ID } from "#src/services/crafting/constants";
import { computeInteractionPrompts } from "#src/services/interaction/computeInteractionPrompts";
import { INTERACTION_REACH } from "#src/services/interaction/constants";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeCraftingBenchInteractables, () => {
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const NAME = "Crafting";
  const NO_SELECTION = { selectedId: "", windowStart: 0 };
  const place: CraftingBenchPlace = { position: { x: 1, z: 2 }, rotation: 0 };
  const interactables = computeCraftingBenchInteractables(place, NAME, getGroundHeight);
  const bench = {
    id: CRAFTING_BENCH_INTERACTABLE_ID,
    kind: InteractionKind.Use,
    name: NAME,
    position: { x: 1, y: GROUND_HEIGHT, z: 2 },
  };

  test("the bench offers its prompt within reach", () => {
    expect.hasAssertions();

    const body = { x: 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([bench]);
  });

  test("the bench offers no prompt out of reach", () => {
    expect.hasAssertions();

    const body = { x: 1 + INTERACTION_REACH + 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([]);
  });
});
