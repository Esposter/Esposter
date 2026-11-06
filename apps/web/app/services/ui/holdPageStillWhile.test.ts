// @vitest-environment nuxt
import { holdPageStillWhile } from "@/services/ui/holdPageStillWhile";
import { describe, expect, test } from "vitest";

describe(holdPageStillWhile, () => {
  test("a touch move is held only while the drag is", () => {
    expect.hasAssertions();

    const abortController = new AbortController();
    let isDragging = false;
    holdPageStillWhile(() => isDragging, abortController.signal);
    const beforeDrag = new Event("touchmove", { cancelable: true });
    window.dispatchEvent(beforeDrag);
    isDragging = true;
    const duringDrag = new Event("touchmove", { cancelable: true });
    window.dispatchEvent(duringDrag);
    abortController.abort();
    const afterDrag = new Event("touchmove", { cancelable: true });
    window.dispatchEvent(afterDrag);

    expect(beforeDrag.defaultPrevented).toBe(false);
    expect(duringDrag.defaultPrevented).toBe(true);
    expect(afterDrag.defaultPrevented).toBe(false);
  });
});
