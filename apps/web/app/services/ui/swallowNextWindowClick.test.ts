// @vitest-environment nuxt
import { SWALLOW_WINDOW_MS } from "@/services/ui/constants";
import { swallowNextWindowClick } from "@/services/ui/swallowNextWindowClick";
import { afterEach, describe, expect, test, vi } from "vitest";

const click = () => {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  window.dispatchEvent(event);
  return event;
};

describe(swallowNextWindowClick, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("a click after the window has passed is let through, since a touch drag raises none", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    swallowNextWindowClick();
    vi.advanceTimersByTime(SWALLOW_WINDOW_MS);

    expect(click().defaultPrevented).toBe(false);
  });

  test("the click that follows a release is swallowed, and only that one", () => {
    expect.hasAssertions();

    swallowNextWindowClick();

    expect(click().defaultPrevented).toBe(true);
    expect(click().defaultPrevented).toBe(false);
  });

  test("a press lets the next click through, since it starts something whose click is its own", () => {
    expect.hasAssertions();

    swallowNextWindowClick();
    window.dispatchEvent(new PointerEvent("pointerdown"));

    expect(click().defaultPrevented).toBe(false);
  });

  test("a key lets the next click through", () => {
    expect.hasAssertions();

    swallowNextWindowClick();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(click().defaultPrevented).toBe(false);
  });

  test("the returned stop lets the next click through", () => {
    expect.hasAssertions();

    const stop = swallowNextWindowClick();
    stop();

    expect(click().defaultPrevented).toBe(false);
  });
});
