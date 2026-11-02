// @vitest-environment happy-dom
import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { dispatchPanzoomChange } from "#src/services/panzoom/dispatchPanzoomChange";
import { describe, expect, test } from "vitest";

describe(dispatchPanzoomChange, () => {
  test("the event for what caused the change is sent before the change, with the same detail", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const sent: string[] = [];
    const details: unknown[] = [];
    element.addEventListener(PanzoomEventName.Pan, (event) => {
      sent.push(event.type);
      details.push((event as CustomEvent).detail);
    });
    element.addEventListener(PanzoomEventName.Change, (event) => {
      sent.push(event.type);
      details.push((event as CustomEvent).detail);
    });
    const detail = { isSVG: false, scale: 1, x: 0, y: 0 };

    dispatchPanzoomChange({ element, isDestroyed: false }, PanzoomEventName.Pan, detail, {});

    expect(sent).toStrictEqual([PanzoomEventName.Pan, PanzoomEventName.Change]);
    expect(details).toStrictEqual([detail, detail]);
  });
});
