import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";

import { freezeFrameGeometry } from "@/services/pageBuilder/freezeFrameGeometry";
import { describe, expect, test } from "vitest";

describe(freezeFrameGeometry, () => {
  const createGeometry = (rects: Record<string, FrameGeometry["frameRect"]>, getScrollTop: () => number) => ({
    checkIsHorizontalOwner: () => false,
    frameRect: { height: 600, left: 0, top: 0, width: 800 },
    getChildRect: (nodeId: string) => rects[nodeId],
    getNodeIdAt: () => undefined,
    getScrollTop,
    scale: 1,
  });

  test("a frozen frame keeps the boxes it was frozen with, though the frame moves its nodes after", () => {
    expect.hasAssertions();

    const rects: Record<string, FrameGeometry["frameRect"]> = { text: { height: 20, left: 0, top: 100, width: 800 } };
    const frozen = freezeFrameGeometry(
      createGeometry(rects, () => 0),
      ["text"],
    );
    rects.text = { height: 20, left: 0, top: 140, width: 800 };

    expect(frozen.getChildRect("text")?.top).toBe(100);
  });

  test("a frozen frame moves its boxes by what the frame has scrolled since", () => {
    expect.hasAssertions();

    let scrollTop = 30;
    // A browser's rect holds its sides as getters on its prototype, which a spread does not copy
    class BrowserRect {
      get height() {
        return 20;
      }
      get left() {
        return 0;
      }
      get top() {
        return 100;
      }
      get width() {
        return 800;
      }
    }
    const frozen = freezeFrameGeometry(
      createGeometry({ text: new BrowserRect() }, () => scrollTop),
      ["text"],
    );
    scrollTop = 80;

    expect(frozen.getChildRect("text")).toStrictEqual({ height: 20, left: 0, top: 50, width: 800 });
  });

  test("the node under a point is the innermost box holding it", () => {
    expect.hasAssertions();

    const frozen = freezeFrameGeometry(
      createGeometry(
        { section: { height: 200, left: 0, top: 0, width: 800 }, text: { height: 20, left: 0, top: 50, width: 800 } },
        () => 0,
      ),
      ["section", "text"],
    );

    expect(frozen.getNodeIdAt({ x: 10, y: 60 })).toBe("text");
    expect(frozen.getNodeIdAt({ x: 10, y: 150 })).toBe("section");
    expect(frozen.getNodeIdAt({ x: 10, y: 400 })).toBeUndefined();
  });
});
