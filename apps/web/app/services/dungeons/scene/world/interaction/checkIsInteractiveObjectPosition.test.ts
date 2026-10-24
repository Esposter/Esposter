import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";

import { checkIsInteractiveObjectPosition } from "@/services/dungeons/scene/world/interaction/checkIsInteractiveObjectPosition";
import { Direction } from "grid-engine";
import { describe, expect, test } from "vitest";

describe(checkIsInteractiveObjectPosition, () => {
  const playerPosition = { x: 3, y: 3 };
  const objectPosition = { x: 3, y: 4 };
  const interactableDirectionMap: InteractableDirectionMap = {
    [Direction.DOWN]: true,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
    [Direction.UP]: false,
  };

  test("the object is interactive when the player faces it from an interactable direction", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.DOWN, objectPosition, interactableDirectionMap),
    ).toBe(true);
  });

  test("an object beside the facing tile is not interactive", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.DOWN, { x: 2, y: 4 }, interactableDirectionMap),
    ).toBe(false);
  });

  test("an object in front is not interactive from a direction the map does not allow", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.LEFT, { x: 2, y: 3 }, interactableDirectionMap),
    ).toBe(false);
  });

  test("a diagonal or standing player never interacts, even with an object in reach", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.DOWN_LEFT, { x: 2, y: 4 }, interactableDirectionMap),
    ).toBe(false);
    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.NONE, playerPosition, interactableDirectionMap),
    ).toBe(false);
  });
});
