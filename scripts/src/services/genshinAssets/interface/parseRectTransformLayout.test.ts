import { parseRectTransformLayout } from "#src/services/genshinAssets/interface/parseRectTransformLayout";
import { describe, expect, test } from "vitest";

describe(parseRectTransformLayout, () => {
  test("reads the layout from the raw export's last ten floats, after whatever the Transform holds", () => {
    expect.hasAssertions();

    const floats = [1, 0, 1, 0, -54, 54, 52, 520, 1, 0];
    const raw = Buffer.alloc(8 + floats.length * 4);
    for (const [index, value] of floats.entries()) raw.writeFloatLE(value, 8 + index * 4);

    expect(parseRectTransformLayout(raw)).toStrictEqual({
      anchoredPosition: [-54, 54],
      anchorMax: [1, 0],
      anchorMin: [1, 0],
      pivot: [1, 0],
      sizeDelta: [52, 520],
    });
  });
});
