// @vitest-environment happy-dom
import { checkIsNestedInteraction } from "#src/util/dom/checkIsNestedInteraction";
import { describe, expect, onTestFinished, test } from "vitest";

describe(checkIsNestedInteraction, () => {
  test("true for the click that ends a text selection", () => {
    expect.hasAssertions();

    const container = document.createElement("div");
    container.textContent = "a";
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
      window.getSelection()?.removeAllRanges();
    });
    window.getSelection()?.selectAllChildren(container);
    let isNestedInteraction: boolean | undefined;
    container.addEventListener("click", (event) => {
      isNestedInteraction = checkIsNestedInteraction(event);
    });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(isNestedInteraction).toBe(true);
  });
});
