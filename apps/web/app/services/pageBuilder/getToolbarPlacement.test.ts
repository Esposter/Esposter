import type { FramePlacement } from "@/models/pageBuilder/FramePlacement";

import { getToolbarPlacement, TOOLBAR_HEIGHT } from "@/services/pageBuilder/getToolbarPlacement";
import { describe, expect, test } from "vitest";

describe(getToolbarPlacement, () => {
  const FRAME: FramePlacement = { height: 400, left: 300, scale: 1, top: 100 };
  const BOX = { height: 50, left: 20, top: 120, width: 200 };

  test("the toolbar sits above its node when the canvas has room for it", () => {
    expect.hasAssertions();

    expect(getToolbarPlacement(BOX, FRAME)).toStrictEqual({ left: 320, top: 100 + 120 - TOOLBAR_HEIGHT });
  });

  test("the toolbar sits below its node when there is no room above it", () => {
    expect.hasAssertions();

    expect(getToolbarPlacement({ ...BOX, top: 0 }, FRAME)).toStrictEqual({ left: 320, top: 100 + 50 });
  });

  test("the toolbar is hidden once its node has scrolled out of the canvas", () => {
    expect.hasAssertions();

    expect(getToolbarPlacement({ ...BOX, top: -60 }, FRAME)).toBeUndefined();
  });

  test("the toolbar is hidden while its node is below the canvas", () => {
    expect.hasAssertions();

    expect(getToolbarPlacement({ ...BOX, top: 400 }, FRAME)).toBeUndefined();
  });

  test("the toolbar stays inside the canvas when its node runs past the bottom edge", () => {
    expect.hasAssertions();

    expect(getToolbarPlacement({ ...BOX, height: 450, top: 0 }, FRAME)).toStrictEqual({
      left: 320,
      top: 100 + 400 - TOOLBAR_HEIGHT,
    });
  });

  test("the toolbar follows its node through the canvas's scale", () => {
    expect.hasAssertions();

    expect(getToolbarPlacement(BOX, { ...FRAME, scale: 0.5 })).toStrictEqual({
      left: 300 + 10,
      top: 100 + 60 - TOOLBAR_HEIGHT,
    });
  });
});
