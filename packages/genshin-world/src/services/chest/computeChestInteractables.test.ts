import { ChestKind } from "#src/models/chest/ChestKind";
import { computeChestInteractables } from "#src/services/chest/computeChestInteractables";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeChestInteractables, () => {
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const gameText = {
    [GameTextKey.CommonChest]: "Common Chest",
    [GameTextKey.ExquisiteChest]: "Exquisite Chest",
    [GameTextKey.PreciousChest]: "Precious Chest",
    [GameTextKey.LuxuriousChest]: "Luxurious Chest",
  };
  const position = { x: 1, z: 2 };

  test("offers each unopened chest of a rewarded kind, named by its kind", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [{ id: "common", kind: ChestKind.Common, position }],
        new Set(),
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([
      { id: "common", kind: InteractionKind.Open, name: "Common Chest", position: { x: 1, y: GROUND_HEIGHT, z: 2 } },
    ]);
  });

  test("offers an unopened Luxurious chest, named by its kind", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [{ id: "luxurious", kind: ChestKind.Luxurious, position }],
        new Set(),
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([
      {
        id: "luxurious",
        kind: InteractionKind.Open,
        name: "Luxurious Chest",
        position: { x: 1, y: GROUND_HEIGHT, z: 2 },
      },
    ]);
  });

  test("leaves out an opened chest, and a chest of a kind with no reward yet", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [
          { id: "opened", kind: ChestKind.Common, position },
          { id: "sealed", kind: ChestKind.Sealed, position },
          { id: "buried", kind: ChestKind.Buried, position },
        ],
        new Set(["opened"]),
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([]);
  });
});
