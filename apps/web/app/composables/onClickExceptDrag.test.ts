// @vitest-environment happy-dom
import { onClickExceptDrag } from "#src/composables/onClickExceptDrag";
import { describe, expect, test, vi } from "vitest";

describe(onClickExceptDrag, () => {
  // A press released off the element sends it no click, so the click after it must not be swallowed as the end of a
  // Drag
  test.each([
    {
      description: "re-entered after a release off it",
      steps: [
        { isOnElement: true, type: "mousedown" },
        { isOnElement: false, type: "mouseup" },
        { isOnElement: true, type: "mousemove" },
      ],
    },
    {
      description: "dragged out of it and released off it",
      steps: [
        { isOnElement: true, type: "mousedown" },
        { isOnElement: true, type: "mousemove" },
        { isOnElement: false, type: "mouseup" },
      ],
    },
  ])("a press $description leaves the next click its own", ({ steps }) => {
    expect.hasAssertions();

    const element = document.createElement("div");
    document.body.append(element);
    const handler = vi.fn<(event: PointerEvent) => void>();
    const stop = onClickExceptDrag(element, handler);
    for (const { isOnElement, type } of steps) {
      const target = isOnElement ? element : document.body;
      target.dispatchEvent(new MouseEvent(type, { bubbles: true }));
    }
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);

    stop();
    element.remove();
  });
});
