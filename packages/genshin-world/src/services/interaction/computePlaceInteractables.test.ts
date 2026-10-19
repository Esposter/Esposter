import { computeInteractionPrompts } from "#src/services/interaction/computeInteractionPrompts";
import { computePlaceInteractables } from "#src/services/interaction/computePlaceInteractables";
import { INTERACTION_REACH } from "#src/services/interaction/constants";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computePlaceInteractables, () => {
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const ID = "craftingBench";
  const NAME = "Crafting";
  const NO_SELECTION = { selectedId: "", windowStart: 0 };
  const place = { position: { x: 1, z: 2 } };
  const interactables = computePlaceInteractables(ID, place, NAME, getGroundHeight);
  const bench = { id: ID, kind: InteractionKind.Use, name: NAME, position: { x: 1, y: GROUND_HEIGHT, z: 2 } };

  test("the place offers its prompt within reach", () => {
    expect.hasAssertions();

    const body = { x: 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([bench]);
  });

  test("the place offers no prompt out of reach", () => {
    expect.hasAssertions();

    const body = { x: 1 + INTERACTION_REACH + 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([]);
  });

  test("a place the record does not hold offers no prompt", () => {
    expect.hasAssertions();

    expect(computePlaceInteractables(ID, undefined, NAME, getGroundHeight)).toStrictEqual([]);
  });
});
