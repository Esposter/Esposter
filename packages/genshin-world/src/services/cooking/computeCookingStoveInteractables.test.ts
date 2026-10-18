import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { COOKING_STOVE_INTERACTABLE_ID } from "#src/services/cooking/constants";
import { computeCookingStoveInteractables } from "#src/services/cooking/computeCookingStoveInteractables";
import { computeInteractionPrompts } from "#src/services/interaction/computeInteractionPrompts";
import { INTERACTION_REACH } from "#src/services/interaction/constants";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeCookingStoveInteractables, () => {
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const NAME = "Cook";
  const NO_SELECTION = { selectedId: "", windowStart: 0 };
  const place: SceneGroupPlace = { position: { x: 1, z: 2 }, source: SceneGroupSource.ScenePoints };
  const interactables = computeCookingStoveInteractables(place, NAME, getGroundHeight);
  const stove = {
    id: COOKING_STOVE_INTERACTABLE_ID,
    kind: InteractionKind.Activate,
    name: NAME,
    position: { x: 1, y: GROUND_HEIGHT, z: 2 },
  };

  test("a city stove cooks where a campfire would be out", () => {
    expect.hasAssertions();

    const body = { x: 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([stove]);
  });

  test("a city with no stove offers none", () => {
    expect.hasAssertions();

    expect(computeCookingStoveInteractables(undefined, NAME, getGroundHeight)).toStrictEqual([]);
  });

  test("a stove offers no prompt out of reach", () => {
    expect.hasAssertions();

    const body = { x: 1 + INTERACTION_REACH + 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([]);
  });
});
