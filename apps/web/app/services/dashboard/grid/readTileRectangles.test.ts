import type { VueWrapper } from "@vue/test-utils";

import { assert, describe } from "vitest";

// The rectangle each rendered tile is laid out at, read from its inline style in the order the tiles are rendered
export const readTileRectangles = (wrapper: Pick<VueWrapper, "findAll">) =>
  wrapper.findAll(".dashboard-grid-tile").map((tile) => {
    assert(tile.element instanceof HTMLElement);

    return {
      height: tile.element.style.height,
      left: tile.element.style.left,
      top: tile.element.style.top,
      width: tile.element.style.width,
    };
  });

describe.todo("readTileRectangles");
