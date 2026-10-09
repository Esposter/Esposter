import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { toGenshinSave } from "#src/services/save/toGenshinSave";
import { describe, expect, it } from "vitest";

describe(readGenshinSave, () => {
  it("reads a save back to the same save once written", () => {
    expect.hasAssertions();
    expect(toGenshinSave(readGenshinSave(EMPTY_GENSHIN_SAVE))).toStrictEqual(EMPTY_GENSHIN_SAVE);
  });
});
