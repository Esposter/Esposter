import { getEdgeScrollVelocity } from "@/services/pageBuilder/getEdgeScrollVelocity";
import { DRAG_AUTOSCROLL_EDGE, DRAG_AUTOSCROLL_SPEED } from "@/services/ui/constants";
import { describe, expect, test } from "vitest";

describe(getEdgeScrollVelocity, () => {
  test("a drag at the edge scrolls", () => {
    expect.hasAssertions();
    const frameRect = { height: 500, top: 100 };

    expect(getEdgeScrollVelocity(frameRect.top + DRAG_AUTOSCROLL_EDGE / 2, frameRect)).toBe(-DRAG_AUTOSCROLL_SPEED / 2);
    expect(getEdgeScrollVelocity(frameRect.top + frameRect.height - DRAG_AUTOSCROLL_EDGE / 2, frameRect)).toBe(
      DRAG_AUTOSCROLL_SPEED / 2,
    );
  });

  test("a drag in the middle of the frame does not scroll it", () => {
    expect.hasAssertions();

    expect(getEdgeScrollVelocity(100 + 500 / 2, { height: 500, top: 100 })).toBe(0);
  });

  test("a pointer past the edge scrolls at full speed", () => {
    expect.hasAssertions();

    expect(getEdgeScrollVelocity(100 - DRAG_AUTOSCROLL_EDGE, { height: 500, top: 100 })).toBe(-DRAG_AUTOSCROLL_SPEED);
  });
});
