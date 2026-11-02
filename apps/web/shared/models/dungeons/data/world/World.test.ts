import { Chest } from "#shared/models/dungeons/data/world/Chest";
import { worldSchema } from "#shared/models/dungeons/data/world/World";
import { MAX_CHESTS } from "#shared/models/dungeons/data/world/WorldData";
import { TilemapKeys } from "#shared/models/dungeons/keys/TilemapKey";
import { getInitialWorld } from "#shared/services/dungeons/world/getInitialWorld";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("worldSchema", () => {
  test("parses each map's chests through their own schema, so a key a chest does not declare is stripped", () => {
    expect.hasAssertions();

    const tilemapKey = takeOne(TilemapKeys, 0);
    const { isOpened, itemId } = new Chest();
    const chestId = `0${ID_SEPARATOR}0`;
    const parsedWorld = worldSchema.parse({
      ...getInitialWorld(),
      [tilemapKey]: { chestMap: { [chestId]: { isOpened, itemId, junk: true } } },
    });

    expect(parsedWorld[tilemapKey]).toStrictEqual({ chestMap: { [chestId]: { isOpened, itemId } } });
  });

  test("refuses a map that holds more chests than MAX_CHESTS", () => {
    expect.hasAssertions();

    const tilemapKey = takeOne(TilemapKeys, 0);
    const chestMap = Object.fromEntries(
      Array.from({ length: MAX_CHESTS + 1 }, (_value, index) => [`${index}${ID_SEPARATOR}0`, new Chest()]),
    );

    expect(worldSchema.safeParse({ ...getInitialWorld(), [tilemapKey]: { chestMap } }).success).toBe(false);
  });
});
