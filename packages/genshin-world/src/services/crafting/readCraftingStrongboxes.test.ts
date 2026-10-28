import { readCraftingStrongboxes } from "#src/services/crafting/readCraftingStrongboxes";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { afterEach, describe, expect, test, vi } from "vitest";

// Reads are memoized by the object's URL, so each test names its own base URL
describe(readCraftingStrongboxes, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a strongbox record that does not match its shape is refused", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json([{ id: 90_001, nameTextId: "90_002", needCount: 3, pieceItemIds: [], rarity: 5 }]),
    );

    await expect(readCraftingStrongboxes("crafting-strongboxes-refused")).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "origin": "array",
          "code": "too_small",
          "minimum": 1,
          "inclusive": true,
          "path": [
            0,
            "pieceItemIds"
          ],
          "message": "Too small: expected array to have >=1 items"
        }
      ]]
    `);
  });

  test("a strongbox record lacking a piece's item id is refused", async () => {
    expect.hasAssertions();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json([{ id: 90_001, nameTextId: "90_002", needCount: 3, pieceItemIds: [null], rarity: 5 }]),
    );

    await expect(readCraftingStrongboxes("crafting-strongboxes-missing-piece")).rejects
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "number",
          "code": "invalid_type",
          "path": [
            0,
            "pieceItemIds",
            0
          ],
          "message": "Invalid input: expected number, received null"
        }
      ]]
    `);
  });

  test("reads the strongbox records of the hosted game data by their key", async () => {
    expect.hasAssertions();

    const strongbox = { id: 90_001, nameTextId: "90_002", needCount: 3, pieceItemIds: [90_011, 90_012], rarity: 5 };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([strongbox]));

    await expect(readCraftingStrongboxes("crafting-strongboxes-read")).resolves.toStrictEqual([strongbox]);
    expect(fetch.mock.calls.map(([url]) => url)).toStrictEqual([
      `crafting-strongboxes-read/crafting/strongboxes/${gameDataLock.objects["crafting/strongboxes"]}.json`,
    ]);
  });
});
