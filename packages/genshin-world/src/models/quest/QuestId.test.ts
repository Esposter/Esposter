import { QuestId, QuestIds } from "#src/models/quest/QuestId";
import { describe, expect, test } from "vitest";

describe("questIds", () => {
  // The main quest each city opens with, by the dump's city table: a region's commissions join the deal once it is done.
  // Mondstadt's is not carried: its sub quest holds no words and no objective, so there is nothing to step through
  const OPENING_QUEST_IDS = [QuestId.LiyueOpening, QuestId.InazumaOpening, QuestId.SumeruOpening];

  test("lists every carried quest once", () => {
    expect.hasAssertions();

    expect(QuestIds.toSorted()).toStrictEqual(Object.values(QuestId).toSorted());
  });

  test("carries the opening quest each carried region's commissions join the deal behind", () => {
    expect.hasAssertions();

    expect(QuestIds).toStrictEqual(expect.arrayContaining(OPENING_QUEST_IDS));
  });
});
