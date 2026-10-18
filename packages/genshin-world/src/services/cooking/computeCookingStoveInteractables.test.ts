import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { computeCookingStoveInteractables } from "#src/services/cooking/computeCookingStoveInteractables";
import { COOKING_PROCESSING_INTERACTABLE_ID, COOKING_STOVE_INTERACTABLE_ID } from "#src/services/cooking/constants";
import { computeInteractionPrompts } from "#src/services/interaction/computeInteractionPrompts";
import { INTERACTION_REACH } from "#src/services/interaction/constants";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeCookingStoveInteractables, () => {
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const NAMES = { cooking: "Cook", processing: "Process" };
  const NO_SELECTION = { selectedId: "", windowStart: 0 };
  const place: SceneGroupPlace = { position: { x: 1, z: 2 }, source: SceneGroupSource.ScenePoints };
  const interactables = computeCookingStoveInteractables(place, NAMES, getGroundHeight);
  const position = { x: 1, y: GROUND_HEIGHT, z: 2 };
  const stove = { id: COOKING_STOVE_INTERACTABLE_ID, kind: InteractionKind.Activate, name: NAMES.cooking, position };
  const processing = {
    id: COOKING_PROCESSING_INTERACTABLE_ID,
    kind: InteractionKind.Activate,
    name: NAMES.processing,
    position,
  };

  test("a city stove cooks where a campfire would be out", () => {
    expect.hasAssertions();

    const body = { x: 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toContainEqual(stove);
  });

  test("a stove offers processing beside cooking", () => {
    expect.hasAssertions();

    const body = { x: 1, y: GROUND_HEIGHT, z: 2 };

    const prompts = computeInteractionPrompts(interactables, body, NO_SELECTION).interactables;

    expect(prompts).toHaveLength(2);
    expect(prompts).toContainEqual(stove);
    expect(prompts).toContainEqual(processing);
  });

  test("a city with no stove offers none", () => {
    expect.hasAssertions();

    expect(computeCookingStoveInteractables(undefined, NAMES, getGroundHeight)).toStrictEqual([]);
  });

  test("a stove offers no prompt out of reach", () => {
    expect.hasAssertions();

    const body = { x: 1 + INTERACTION_REACH + 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeInteractionPrompts(interactables, body, NO_SELECTION).interactables).toStrictEqual([]);
  });
});
