import { getToolbarFolds } from "@/services/editor/getToolbarFolds";
import { describe, expect, test } from "vitest";

describe(getToolbarFolds, () => {
  const width = 1;
  const wideWidth = 2;
  const availableWidth = 3;
  const overflowWidth = 1;

  test("folds nothing while every item fits", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({ availableWidth: width + width, items: [{ width }, { width }], overflowWidth });

    expect(folds).toStrictEqual([false, false]);
  });

  test("keeps its pinned items and folds the rest from the first that does not fit", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({
      availableWidth,
      items: [{ isPinned: true, width }, { width }, { width }, { isPinned: true, width }],
      overflowWidth,
    });

    expect(folds).toStrictEqual([false, true, true, false]);
  });

  test("folds each item after the first that does not fit, even one that would fit", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({
      availableWidth,
      items: [{ width }, { width: wideWidth }, { width }],
      overflowWidth,
    });

    expect(folds).toStrictEqual([false, true, true]);
  });
});
