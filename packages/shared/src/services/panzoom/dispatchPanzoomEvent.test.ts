// @vitest-environment happy-dom
import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { dispatchPanzoomEvent } from "#src/services/panzoom/dispatchPanzoomEvent";
import { describe, expect, test, vi } from "vitest";

describe(dispatchPanzoomEvent, () => {
  test("the event carries the detail and does not bubble", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const events: CustomEvent[] = [];
    element.addEventListener(PanzoomEventName.Zoom, (event) => {
      events.push(event as CustomEvent);
    });
    const detail = { isSVG: false, scale: 1, x: 0, y: 0 };

    dispatchPanzoomEvent({ element, isDestroyed: false }, PanzoomEventName.Zoom, detail, {});

    const [event] = events;
    expect(events).toHaveLength(1);
    expect(event?.bubbles).toBe(false);
    expect(event?.detail).toStrictEqual(detail);
  });

  test("a silent call sends no event", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const listener = vi.fn<(event: Event) => void>();
    element.addEventListener(PanzoomEventName.Zoom, listener);

    dispatchPanzoomEvent(
      { element, isDestroyed: false },
      PanzoomEventName.Zoom,
      { isSVG: false, scale: 1, x: 0, y: 0 },
      { silent: true },
    );

    expect(listener).not.toHaveBeenCalled();
  });
});
