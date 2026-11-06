import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { checkDatasetLockCurrent } from "#src/services/genshinProgress/checkDatasetLockCurrent";
import { describe, expect, test } from "vitest";

describe(checkDatasetLockCurrent, () => {
  test("A dataset's lock is current when every key its readers require has an entry", () => {
    expect.hasAssertions();

    const lock = { indexes: ["domains"], objects: ["stats/characters", "tips"] };

    expect(
      checkDatasetLockCurrent("text", { indexes: ["domains"], objects: ["shops/goods", "tips"] }, lock),
    ).toStrictEqual({
      name: "dataset text: lock current",
      notes: ["shops/goods has no entry in the lock"],
      state: GenshinExitCheckState.NotMet,
    });
    expect(checkDatasetLockCurrent("text", { indexes: ["domains"], objects: ["tips"] }, lock)).toStrictEqual({
      name: "dataset text: lock current",
      notes: [],
      state: GenshinExitCheckState.Met,
    });
  });
});
