import type { Interactable } from "#src/models/interaction/Interactable";

import { getHeldPickUp } from "#src/services/interaction/getHeldPickUp";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createInteractable = (id: string, kind: InteractionKind): Interactable => ({
  id,
  kind,
  name: "",
  position: { x: 0, y: 0, z: 0 },
});

describe(getHeldPickUp, () => {
  const talk = createInteractable("a", InteractionKind.Talk);
  const firstItem = createInteractable("b", InteractionKind.PickUp);
  const secondItem = createInteractable("c", InteractionKind.PickUp);
  const interactables = [talk, firstItem, secondItem];

  test("picks up the selected row when it is an item", () => {
    expect.hasAssertions();

    expect(getHeldPickUp({ interactables, selectedId: secondItem.id, windowStart: 0 })).toBe(secondItem);
  });

  test("picks up the first item when the selected row is not one", () => {
    expect.hasAssertions();

    expect(getHeldPickUp({ interactables, selectedId: talk.id, windowStart: 0 })).toBe(firstItem);
  });

  test("picks up nothing with no item in reach", () => {
    expect.hasAssertions();

    expect(getHeldPickUp({ interactables: [talk], selectedId: talk.id, windowStart: 0 })).toBeUndefined();
  });
});
