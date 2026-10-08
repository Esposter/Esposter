import type { Interactable } from "#src/models/interaction/Interactable";

import { computeInteractionPrompts } from "#src/services/interaction/computeInteractionPrompts";
import { INTERACTION_REACH, INTERACTION_WINDOW_SIZE } from "#src/services/interaction/constants";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createInteractable = (id: string, x: number): Interactable => ({
  id,
  kind: InteractionKind.PickUp,
  name: "",
  position: { x, y: 0, z: 0 },
});

describe(computeInteractionPrompts, () => {
  const position = { x: 0, y: 0, z: 0 };
  const nearest = createInteractable("c", 0);
  const first = createInteractable("a", 1);
  const second = createInteractable("b", 1);
  const outOfReach = createInteractable("d", INTERACTION_REACH + 1);
  const interactables = [second, outOfReach, first, nearest];

  test("rows what is in reach, nearest first and by id at one distance", () => {
    expect.hasAssertions();

    expect(computeInteractionPrompts(interactables, position, { selectedId: "", windowStart: 0 })).toStrictEqual({
      interactables: [nearest, first, second],
      selectedId: nearest.id,
      windowStart: 0,
    });
  });

  test("keeps the selection on its thing", () => {
    expect.hasAssertions();

    expect(
      computeInteractionPrompts(interactables, position, { selectedId: second.id, windowStart: 0 }).selectedId,
    ).toBe(second.id);
  });

  test("selects the first row once the selected thing leaves reach", () => {
    expect.hasAssertions();

    expect(
      computeInteractionPrompts(interactables, position, { selectedId: outOfReach.id, windowStart: 0 }).selectedId,
    ).toBe(nearest.id);
  });

  test("scrolls the window just far enough to show the selection", () => {
    expect.hasAssertions();

    const rows = Array.from({ length: INTERACTION_WINDOW_SIZE + 1 }, (_value, index) =>
      createInteractable(String(index), (index * INTERACTION_REACH) / INTERACTION_WINDOW_SIZE),
    );
    const lastId = String(INTERACTION_WINDOW_SIZE);

    expect(computeInteractionPrompts(rows, position, { selectedId: lastId, windowStart: 0 }).windowStart).toBe(1);
    expect(computeInteractionPrompts(rows, position, { selectedId: "1", windowStart: 1 }).windowStart).toBe(1);
    expect(computeInteractionPrompts(rows, position, { selectedId: "0", windowStart: 1 }).windowStart).toBe(0);
  });
});
