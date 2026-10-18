import { readTitleQuestIds } from "#src/services/genshinText/readTitleQuestIds";
import { describe, expect, test } from "vitest";

describe(readTitleQuestIds, () => {
  // Made-up text: a quest's title and a chapter's title each under a text hash, the chapter's end quest in the sub quest table
  const textMap = new Map([
    ["11", "Made Up Quest"],
    ["12", "Made Up Chapter"],
    ["13", "Shared Title"],
  ]);
  const subQuestMap = new Map([[9001, { mainId: 901 }]]);

  test("names a quest by its title, and a chapter by the quest its end quest is in", () => {
    expect.hasAssertions();

    const titleQuestIds = readTitleQuestIds(
      textMap,
      [{ id: 900, titleTextMapHash: 11 }],
      [{ chapterTitleTextMapHash: 12, endQuestId: 9001 }],
      subQuestMap,
    );

    expect(titleQuestIds).toStrictEqual(
      new Map([
        ["Made Up Quest", [900]],
        ["Made Up Chapter", [901]],
      ]),
    );
  });

  test("names every quest a title is shared by, so the caller can refuse an ambiguous title", () => {
    expect.hasAssertions();

    const titleQuestIds = readTitleQuestIds(
      textMap,
      [
        { id: 900, titleTextMapHash: 13 },
        { id: 910, titleTextMapHash: 13 },
      ],
      [],
      subQuestMap,
    );

    expect(titleQuestIds.get("Shared Title")).toStrictEqual([900, 910]);
  });
});
