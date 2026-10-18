import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { getMaterialExperience } from "#src/services/artifact/getMaterialExperience";
import { readStatTables } from "#src/services/character/readStatTables";
import { assert, describe, expect, test } from "vitest";

const { artifactExpMaterialMap } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);

describe(getMaterialExperience, () => {
  test("sums each enhancement material's EXP from the game's table, times its count", () => {
    expect.hasAssertions();

    const unction = artifactExpMaterialMap.get(105_002);
    const essence = artifactExpMaterialMap.get(105_003);
    assert(unction !== undefined && essence !== undefined);
    expect(
      getMaterialExperience(artifactExpMaterialMap, [
        { count: 2, id: 105_002 },
        { count: 1, id: 105_003 },
      ]),
    ).toBe(unction.experience * 2 + essence.experience);
  });
});
