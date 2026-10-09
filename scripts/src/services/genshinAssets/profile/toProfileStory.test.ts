import type { ExcelFetterStoryRow } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";

import { toProfileStory } from "#src/services/genshinAssets/profile/toProfileStory";
import { describe, expect, test } from "vitest";

describe(toProfileStory, () => {
  const TITLE_TEXT_ID = 1;
  const CONTEXT_TEXT_ID = 2;
  const MISSING_TEXT_ID = 3;
  const LEVEL = 2;
  const englishTextMap = new Map([
    ["1", "Character Story 1"],
    ["2", "Across Inazuma"],
    ["3", "Only English"],
  ]);
  const textMap = new Map([
    ["1", "Erste Geschichte"],
    ["2", "Quer durch Inazuma"],
  ]);
  const makeRow = (openConds: ExcelFetterStoryRow["openConds"]): ExcelFetterStoryRow => ({
    avatarId: 0,
    fetterId: 0,
    openConds,
    storyContextTextMapHash: CONTEXT_TEXT_ID,
    storyTitleTextMapHash: TITLE_TEXT_ID,
  });

  test("opens at its Friendship Level's value", () => {
    expect.hasAssertions();

    expect(
      toProfileStory(
        makeRow([
          { condType: "FETTER_COND_FETTER_LEVEL", paramList: [LEVEL] },
          { condType: "FETTER_COND_NONE", paramList: [] },
        ]),
        textMap,
        englishTextMap,
      ),
    ).toStrictEqual({
      friendshipLevel: LEVEL,
      hasOtherCondition: false,
      text: "Quer durch Inazuma",
      title: "Erste Geschichte",
    });
  });

  test("keeps a story locked whatever its level when a condition other than a level applies", () => {
    expect.hasAssertions();

    expect(
      toProfileStory(
        makeRow([
          { condType: "FETTER_COND_FETTER_LEVEL", paramList: [LEVEL] },
          { condType: "FETTER_COND_FINISH_QUEST", paramList: [1] },
        ]),
        textMap,
        englishTextMap,
      ).hasOtherCondition,
    ).toBe(true);
  });

  test("opens at once with no level, and takes English's text where its language lacks one", () => {
    expect.hasAssertions();

    expect(
      toProfileStory(makeRow([{ condType: "FETTER_COND_NONE", paramList: [] }]), textMap, englishTextMap),
    ).toStrictEqual({
      friendshipLevel: 0,
      hasOtherCondition: false,
      text: "Quer durch Inazuma",
      title: "Erste Geschichte",
    });
    expect(
      toProfileStory({ ...makeRow([]), storyTitleTextMapHash: MISSING_TEXT_ID }, textMap, englishTextMap).title,
    ).toBe("Only English");
  });
});
