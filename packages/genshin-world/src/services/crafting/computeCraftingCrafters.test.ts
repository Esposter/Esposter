import { computeCraftingCrafters } from "#src/services/crafting/computeCraftingCrafters";
import { describe, expect, test } from "vitest";

const nameOf = (characterId: number) => `name ${characterId}`;

describe(computeCraftingCrafters, () => {
  test("using the bench opens crafting with the party's crafter picked", () => {
    expect.hasAssertions();

    expect(computeCraftingCrafters([1002, 1005, 1008], 1005, nameOf)).toStrictEqual({
      crafterId: 1005,
      crafters: [
        { id: 1002, name: "name 1002" },
        { id: 1005, name: "name 1005" },
        { id: 1008, name: "name 1008" },
      ],
    });
  });
});
