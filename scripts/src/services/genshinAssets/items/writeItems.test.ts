import { MATERIALS_PATH } from "#src/services/genshinAssets/items/constants";
import { writeItems } from "#src/services/genshinAssets/items/writeItems";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { WALLET_ITEM_IDS } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(writeItems, () => {
  test("should write no wallet currency into the items", () => {
    expect.hasAssertions();

    const materials = parseMachineJson<{ id: number }[]>(
      readFileSync(join(WORLD_DATA_DIRECTORY, MATERIALS_PATH), "utf8"),
    );

    expect(materials.filter(({ id }) => WALLET_ITEM_IDS.includes(id))).toStrictEqual([]);
  });
});
