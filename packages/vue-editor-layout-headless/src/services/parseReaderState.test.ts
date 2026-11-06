import type { Layout } from "#src/models/Layout";

import { createPanel } from "#src/services/createPanel.test";
import { createRegion } from "#src/services/createRegion.test";
import { getDefaultReaderState } from "#src/services/getDefaultReaderState";
import { parseReaderState } from "#src/services/parseReaderState";
import { describe, expect, test } from "vitest";

describe(parseReaderState, () => {
  const layout: Layout = { canvasId: "c", panels: [createPanel()], regions: [createRegion()] };

  test("a stale id is dropped from a stored state", () => {
    expect.hasAssertions();

    const storedState = {
      regionActivePanelIdMap: { a: "b" },
      regionOpenMap: { a: true, b: true },
      regionSizeMap: { a: 2, b: 2 },
    };

    expect(parseReaderState(layout, storedState)).toStrictEqual({
      regionActivePanelIdMap: {},
      regionOpenMap: { a: true },
      regionSizeMap: { a: 2 },
    });
  });

  test("a stored size outside the limits is clamped", () => {
    expect.hasAssertions();

    const storedState = { regionActivePanelIdMap: {}, regionOpenMap: {}, regionSizeMap: { a: 9 } };

    expect(parseReaderState(layout, storedState)).toStrictEqual({
      ...getDefaultReaderState(),
      regionSizeMap: { a: 3 },
    });
  });

  test("a value that is not a state gives the default", () => {
    expect.hasAssertions();

    expect(parseReaderState(layout, 0)).toStrictEqual(getDefaultReaderState());
  });
});
