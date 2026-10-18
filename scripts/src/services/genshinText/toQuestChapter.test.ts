import type { DumpedChapter } from "#src/models/genshinText/DumpedChapter";

import { toQuestChapter } from "#src/services/genshinText/toQuestChapter";
import { describe, expect, test } from "vitest";

describe(toQuestChapter, () => {
  test("a chapter lists its title and number", () => {
    expect.hasAssertions();

    const chapter: DumpedChapter = {
      chapterNumTextMapHash: 2,
      chapterTitleTextMapHash: 1,
      cityId: 3,
      endQuestId: 0,
      id: 4,
    };

    expect(toQuestChapter(chapter, "5", ["6"], [])).toStrictEqual({
      id: "4",
      journalTextId: "1",
      numberTextId: "2",
      questIds: ["6"],
      regionTextId: "5",
      rewards: [],
      titleTextId: "1",
    });
  });

  test("a chapter with no number has none to list", () => {
    expect.hasAssertions();

    const chapter: DumpedChapter = {
      chapterNumTextMapHash: 0,
      chapterTitleTextMapHash: 1,
      cityId: 3,
      endQuestId: 0,
      id: 4,
    };

    expect(toQuestChapter(chapter, "5", ["6"], []).numberTextId).toBe("");
  });
});
