// @vitest-environment happy-dom
import { checkIsNestedControl } from "#src/util/dom/checkIsNestedControl";
import { assert, describe, expect, onTestFinished, test } from "vitest";

// Clicks `target` with a listener on `container`, reading the guard while the event is at the container
const click = (container: HTMLElement, target: Element) => {
  document.body.append(container);
  onTestFinished(() => {
    container.remove();
  });
  let isNestedControl: boolean | undefined;
  container.addEventListener("click", (event) => {
    isNestedControl = checkIsNestedControl(event);
  });
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  return isNestedControl;
};

describe(checkIsNestedControl, () => {
  test("false for a click on the container or on plain content inside it", () => {
    expect.hasAssertions();

    const container = document.createElement("div");
    const text = document.createElement("span");
    container.append(text);

    expect(click(container, container)).toBe(false);
    expect(click(container, text)).toBe(false);
  });

  test("true for a click inside a link, control, dialog or marked region inside the container", () => {
    expect.hasAssertions();

    for (const innerHtml of [
      '<a href="/"><span></span></a>',
      "<button><span></span></button>",
      "<dialog><span></span></dialog>",
      '<div role="menu"><span></span></div>',
      "<div data-nested-interaction><span></span></div>",
    ]) {
      const container = document.createElement("div");
      container.innerHTML = innerHtml;
      const text = container.querySelector("span");
      assert(text);

      expect(click(container, text)).toBe(true);
    }
  });

  test("false for a click inside a container that is itself a button", () => {
    expect.hasAssertions();

    const container = document.createElement("button");
    const text = document.createElement("span");
    container.append(text);

    expect(click(container, text)).toBe(false);
  });
});
