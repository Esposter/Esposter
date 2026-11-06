import { getToolbarFolds } from "@/services/editor/getToolbarFolds";
import { describe, expect, test } from "vitest";

describe(getToolbarFolds, () => {
  const width = 1;
  const wideWidth = 2;
  const availableWidth = 3;
  const gap = 0;
  const overflowWidth = 1;

  test("folds nothing while every item fits", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({
      availableWidth: width + width,
      gap,
      isOverflowHeld: false,
      items: [{ width }, { width }],
      overflowWidth,
    });

    expect(folds).toStrictEqual([false, false]);
  });

  test("keeps its pinned items and folds the rest from the first that does not fit", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({
      availableWidth,
      gap,
      isOverflowHeld: false,
      items: [{ isPinned: true, width }, { width }, { width }, { isPinned: true, width }],
      overflowWidth,
    });

    expect(folds).toStrictEqual([false, true, true, false]);
  });

  test("folds each item after the first that does not fit, even one that would fit", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({
      availableWidth,
      gap,
      isOverflowHeld: false,
      items: [{ width }, { width: wideWidth }, { width }],
      overflowWidth,
    });

    expect(folds).toStrictEqual([false, true, true]);
  });

  test("counts the gap after each item, so the one that would overflow the bar folds", () => {
    expect.hasAssertions();

    const folds = getToolbarFolds({
      availableWidth: 170,
      gap: 4,
      isOverflowHeld: false,
      items: Array.from({ length: 5 }, () => ({ width: 32 })),
      overflowWidth: 1,
    });

    expect(folds).toStrictEqual([false, false, false, false, true]);
  });

  test("reserves the overflow button in the fit when the bar always holds items in it", () => {
    expect.hasAssertions();

    // The two items fit the bar alone, but not beside the button the bar draws for its held items
    const folds = getToolbarFolds({
      availableWidth: 130,
      gap: 4,
      isOverflowHeld: true,
      items: [{ width: 48 }, { width: 48 }],
      overflowWidth: 40,
    });

    expect(folds).toStrictEqual([false, true]);
  });
});
