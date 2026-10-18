// @vitest-environment happy-dom
import type { MountedGrid } from "#src/models/MountedGrid";

import { findGridAt } from "#src/services/findGridAt";
import { mountedGrids } from "#src/services/mountedGrids";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(findGridAt, () => {
  beforeEach(() => {
    // The DOM here has no elementsFromPoint to spy on, so the test stands one in for the browser's hit list
    document.elementsFromPoint = () => [];
  });
  afterEach(() => {
    vi.restoreAllMocks();
    mountedGrids.clear();
  });

  // The dragged tile is drawn under the pointer, so it is the first hit, and the grid it is over is the one beneath it
  test("a release over another grid routes past the dragged tile", () => {
    expect.hasAssertions();

    const sourceRoot = document.createElement("div");
    const sourceTile = document.createElement("div");
    sourceRoot.append(sourceTile);
    const targetRoot = document.createElement("div");
    const targetTile = document.createElement("div");
    targetRoot.append(targetTile);
    document.body.append(sourceRoot, targetRoot);
    const sourceGrid: MountedGrid = { accept: () => true };
    const targetGrid: MountedGrid = { accept: () => true };
    mountedGrids.set(sourceRoot, sourceGrid);
    mountedGrids.set(targetRoot, targetGrid);
    vi.spyOn(document, "elementsFromPoint").mockReturnValue([sourceTile, targetTile]);

    expect(findGridAt({ x: 0, y: 0 }, sourceTile)).toBe(targetGrid);

    sourceRoot.remove();
    targetRoot.remove();
  });
});
