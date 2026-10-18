import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";

import { toPreviewItems } from "#src/services/genshinAssets/rewards/toPreviewItems";
import { describe, expect, test } from "vitest";

describe(toPreviewItems, () => {
  const ITEM_ID = 7;
  const PREVIEW_ID = 1;

  test("should leave out an empty slot and read a range as its least and most", () => {
    expect.hasAssertions();
    const preview: ExcelRewardPreviewRow = { id: PREVIEW_ID, previewItems: [{ id: 0 }, { count: "4;5", id: ITEM_ID }] };
    expect(toPreviewItems(preview)).toStrictEqual([{ itemId: ITEM_ID, maxCount: 5, minCount: 4 }]);
  });

  test("should refuse an item whose count the dump leaves out, as the empty count", () => {
    expect.hasAssertions();
    const preview: ExcelRewardPreviewRow = { id: PREVIEW_ID, previewItems: [{ id: ITEM_ID }] };
    expect(() => toPreviewItems(preview)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: reward count, ]`,
    );
  });
});
