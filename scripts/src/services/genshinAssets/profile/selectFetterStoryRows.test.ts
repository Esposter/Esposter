import type { ExcelFetterStoryRow } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";

import { selectFetterStoryRows } from "#src/services/genshinAssets/profile/selectFetterStoryRows";
import { describe, expect, test } from "vitest";

const makeRow = (avatarId: number, fetterId: number): ExcelFetterStoryRow => ({
  avatarId,
  fetterId,
  openConds: [],
  storyContextTextMapHash: 0,
  storyTitleTextMapHash: 0,
});
describe(selectFetterStoryRows, () => {
  const CHARACTER_ID = 10_000_002;
  const OTHER_CHARACTER_ID = 10_000_003;
  const NOT_PLAYABLE_ID = 10_000_099;

  test("keeps the rows of the playable characters, grouped by character and ordered by fetter within each", () => {
    expect.hasAssertions();

    const rows = [
      makeRow(OTHER_CHARACTER_ID, 3301),
      makeRow(NOT_PLAYABLE_ID, 9901),
      makeRow(CHARACTER_ID, 3202),
      makeRow(CHARACTER_ID, 3201),
    ];

    expect(selectFetterStoryRows(rows, new Set([CHARACTER_ID, OTHER_CHARACTER_ID]))).toStrictEqual([
      makeRow(CHARACTER_ID, 3201),
      makeRow(CHARACTER_ID, 3202),
      makeRow(OTHER_CHARACTER_ID, 3301),
    ]);
  });
});
