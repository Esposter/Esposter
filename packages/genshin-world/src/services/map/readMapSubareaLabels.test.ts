import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { readMapSubareaLabels } from "#src/services/map/readMapSubareaLabels";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(readMapSubareaLabels, () => {
  test("reads labels, each named by text the English names hold", async () => {
    expect.hasAssertions();

    const [labels, names] = await Promise.all([
      readMapSubareaLabels(GAME_DATA_LOCAL_BASE_URL),
      NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL),
    ]);

    expect(labels.length).toBeGreaterThan(0);
    expect(labels.filter(({ nameTextId }) => names[nameTextId] === undefined)).toStrictEqual([]);
  });
});
