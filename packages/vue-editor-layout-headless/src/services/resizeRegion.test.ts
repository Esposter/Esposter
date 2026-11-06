import { createRegion } from "#src/services/createRegion.test";
import { getDefaultReaderState } from "#src/services/getDefaultReaderState";
import { resizeRegion } from "#src/services/resizeRegion";
import { describe, expect, test } from "vitest";

describe(resizeRegion, () => {
  const region = createRegion();

  test("a resize stays within the region's limits", () => {
    expect.hasAssertions();

    expect(resizeRegion(region, getDefaultReaderState(), 2).regionSizeMap).toStrictEqual({ a: 2 });
  });

  test("a resize past a limit is clamped", () => {
    expect.hasAssertions();

    expect(resizeRegion(region, getDefaultReaderState(), 9).regionSizeMap).toStrictEqual({ a: 3 });
    expect(resizeRegion(region, getDefaultReaderState(), 0).regionSizeMap).toStrictEqual({ a: 1 });
  });

  test("a resize leaves the given state unchanged", () => {
    expect.hasAssertions();

    const readerState = { ...getDefaultReaderState(), regionSizeMap: { a: 1 } };
    const resizedState = resizeRegion(region, readerState, 2);

    expect(readerState.regionSizeMap).toStrictEqual({ a: 1 });
    expect(resizedState.regionSizeMap).toStrictEqual({ a: 2 });
  });
});
