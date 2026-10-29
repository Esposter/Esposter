import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { ScreenMatchMode } from "#src/models/genshinAssets/ui/ScreenMatchMode";
import { UiScaleMode } from "#src/models/genshinAssets/ui/UiScaleMode";
import { composeUiTrees } from "#src/services/genshinAssets/ui/composeUiTrees";
import { describe, expect, test } from "vitest";

describe(composeUiTrees, () => {
  const BLOCK = "00/04949489.blk";
  const CONTAINER = "-1001859426";
  const rect: UiIndexEntry["rect"] = {
    anchoredPosition: [0, 0],
    anchorMax: [1, 1],
    anchorMin: [0, 0],
    pivot: [0.5, 0.5],
    sizeDelta: [0, 0],
  };
  const canvas: UiIndexEntry["canvas"] = {
    matchWidthOrHeight: 0.5,
    referenceResolution: [1920, 1080],
    screenMatchMode: ScreenMatchMode.MatchWidthOrHeight,
    uiScaleMode: UiScaleMode.ScaleWithScreenSize,
  };
  const createEntry = (
    name: string,
    transformId: string,
    fatherId: string,
    childIds: string[] = [],
    path: string[] = [],
  ): UiIndexEntry => ({
    block: BLOCK,
    childIds,
    components: [],
    container: CONTAINER,
    fatherId,
    name,
    path,
    pathId: `${name}-object`,
    rect,
    scale: [1, 1],
    transformId,
  });

  // The canvas scaler's piece lies below the depth asked, so a tree cut at that depth no longer holds it, yet the
  // Container's canvas is still named
  test("names the canvas of a piece the depth cuts off, with the roots cut at that depth", () => {
    expect.hasAssertions();

    const root = createEntry("Page", "page-transform", "", ["head-transform"]);
    const head = { ...createEntry("Head", "head-transform", "page-transform", [], ["Page"]), canvas };

    const { canvas: nearest, roots } = composeUiTrees([root, head], 0);

    expect(nearest?.path).toBe("Page/Head");
    expect(nearest?.canvas).toStrictEqual(canvas);
    expect(roots.map(({ children, name }) => ({ children, name }))).toStrictEqual([{ children: [], name: "Page" }]);
  });
});
