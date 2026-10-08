import type { Interactable } from "#src/models/interaction/Interactable";

import { stepInteractionSelection } from "#src/services/interaction/stepInteractionSelection";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createInteractable = (id: string): Interactable => ({
  id,
  kind: InteractionKind.PickUp,
  name: "",
  position: { x: 0, y: 0, z: 0 },
});

describe(stepInteractionSelection, () => {
  const interactables = [createInteractable("a"), createInteractable("b")];

  test.each([
    ["a", 1, "b"],
    ["b", 1, "b"],
    ["a", -1, "a"],
  ])("from %s by %s selects %s", (selectedId, step, expectedId) => {
    expect.hasAssertions();

    expect(stepInteractionSelection({ interactables, selectedId, windowStart: 0 }, step)).toBe(expectedId);
  });

  test("selects nothing with no rows", () => {
    expect.hasAssertions();

    expect(stepInteractionSelection({ interactables: [], selectedId: "", windowStart: 0 }, 1)).toBe("");
  });
});
