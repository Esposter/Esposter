import { ChestKind } from "#src/models/chest/ChestKind";
import { computeChestInteractables } from "#src/services/chest/computeChestInteractables";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeChestInteractables, () => {
  const GROUND_HEIGHT = 3;
  const getGroundHeight = () => GROUND_HEIGHT;
  const gameText = {
    [GameTextKey.Chest]: "Chest",
    [GameTextKey.CommonChest]: "Common Chest",
    [GameTextKey.Dig]: "Dig",
    [GameTextKey.ExquisiteChest]: "Exquisite Chest",
    [GameTextKey.LuxuriousChest]: "Luxurious Chest",
    [GameTextKey.PreciousChest]: "Precious Chest",
  };
  const position = { x: 1, z: 2 };
  const groundPosition = { x: 1, y: GROUND_HEIGHT, z: 2 };
  const NO_IDS: ReadonlySet<string> = new Set();

  test("offers each unopened chest of a rewarded kind, named by its kind", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [{ id: "common", kind: ChestKind.Common, position }],
        NO_IDS,
        NO_IDS,
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([{ id: "common", kind: InteractionKind.Open, name: "Common Chest", position: groundPosition }]);
  });

  test("offers an unopened Luxurious chest, named by its kind", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [{ id: "luxurious", kind: ChestKind.Luxurious, position }],
        NO_IDS,
        NO_IDS,
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([
      { id: "luxurious", kind: InteractionKind.Open, name: "Luxurious Chest", position: groundPosition },
    ]);
  });

  test("a buried chest offers Dig at its place", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [{ id: "buried", kind: ChestKind.Buried, position }],
        NO_IDS,
        NO_IDS,
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([{ id: "buried", kind: InteractionKind.Dig, name: "Dig", position: groundPosition }]);
  });

  test("a dug chest appears once dug", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [{ id: "buried", kind: ChestKind.Buried, position }],
        NO_IDS,
        new Set(["buried"]),
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([{ id: "buried", kind: InteractionKind.Open, name: "Chest", position: groundPosition }]);
  });

  test("leaves out an opened chest, and a sealed chest", () => {
    expect.hasAssertions();

    expect(
      computeChestInteractables(
        [
          { id: "opened", kind: ChestKind.Common, position },
          { id: "sealed", kind: ChestKind.Sealed, position },
        ],
        new Set(["opened"]),
        NO_IDS,
        gameText,
        getGroundHeight,
      ),
    ).toStrictEqual([]);
  });
});
