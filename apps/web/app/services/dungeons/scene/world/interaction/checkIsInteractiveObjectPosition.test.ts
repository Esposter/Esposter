import type { InteractableDirectionMap } from "#src/models/dungeons/direction/InteractableDirectionMap";

import { checkIsInteractiveObjectPosition } from "#src/services/dungeons/scene/world/interaction/checkIsInteractiveObjectPosition";
import { Direction } from "grid-engine-headless";
import { describe, expect, test } from "vitest";

describe(checkIsInteractiveObjectPosition, () => {
  const playerPosition = { x: 3, y: 3 };
  const objectPosition = { x: 3, y: 4 };
  const interactableDirectionMap: InteractableDirectionMap = {
    [Direction.Down]: true,
    [Direction.Left]: false,
    [Direction.Right]: false,
    [Direction.Up]: false,
  };

  test("the object is interactive when the player faces it from an interactable direction", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.Down, objectPosition, interactableDirectionMap),
    ).toBe(true);
  });

  test("an object beside the facing tile is not interactive", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.Down, { x: 2, y: 4 }, interactableDirectionMap),
    ).toBe(false);
  });

  test("an object in front is not interactive from a direction the map does not allow", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.Left, { x: 2, y: 3 }, interactableDirectionMap),
    ).toBe(false);
  });

  test("a diagonal or standing player never interacts, even with an object in reach", () => {
    expect.hasAssertions();

    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.DownLeft, { x: 2, y: 4 }, interactableDirectionMap),
    ).toBe(false);
    expect(
      checkIsInteractiveObjectPosition(playerPosition, Direction.None, playerPosition, interactableDirectionMap),
    ).toBe(false);
  });
});
