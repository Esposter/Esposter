import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { describe, expect, test } from "vitest";

describe("genshinSaveSchema", () => {
  // A slice a save predates is refused rather than defaulted: a stored save is backfilled to the shape, so a default
  // Would only hide a save nobody brought to it
  test("refuses a save written before the slices were added", () => {
    expect.hasAssertions();
    const predatingSave = {
      quests: EMPTY_GENSHIN_SAVE.quests,
      unlockedLandmarks: EMPTY_GENSHIN_SAVE.unlockedLandmarks,
      wallet: EMPTY_GENSHIN_SAVE.wallet,
    };

    expect(genshinSaveSchema.safeParse(predatingSave).success).toBe(false);
  });
});
