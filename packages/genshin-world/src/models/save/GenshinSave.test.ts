import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { describe, expect, it } from "vitest";

describe("genshinSaveSchema", () => {
  it("reads a save written before the slices were added as the new player holds them", () => {
    expect.hasAssertions();
    const predatingSave = {
      quests: EMPTY_GENSHIN_SAVE.quests,
      unlockedLandmarks: EMPTY_GENSHIN_SAVE.unlockedLandmarks,
      wallet: EMPTY_GENSHIN_SAVE.wallet,
    };

    expect(genshinSaveSchema.parse(predatingSave)).toStrictEqual(EMPTY_GENSHIN_SAVE);
  });
});
