import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readGatheringItems } from "#src/services/gathering/readGatheringItems";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(readGatheringItems, () => {
  test("every gathering item's name is in the name-text chunks the bag reads its names from", async () => {
    expect.hasAssertions();
    const [items, names] = await Promise.all([readGatheringItems(), NameTextLoaderMap[GameLanguage.English]()]);
    expect(
      items.map(({ nameTextId }) => nameTextId).filter((nameTextId) => names[nameTextId] === undefined),
    ).toStrictEqual([]);
  });
});
