// @vitest-environment happy-dom
import { PANZOOM_SVG_NAMESPACE } from "#src/services/panzoom/constants";
import { createPanzoomContext } from "#src/services/panzoom/createPanzoomContext.test";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { describe, expect, test } from "vitest";

describe(getPanzoomEventDetail, () => {
  test("the detail carries the state's values and the event that caused the change", () => {
    expect.hasAssertions();

    const context = createPanzoomContext(document.createElement("div"), document.createElement("div"));
    context.state = { scale: 2, x: 10, y: 0 };
    const originalEvent = new Event("pointerdown");

    expect(getPanzoomEventDetail(context, originalEvent)).toStrictEqual({
      isSVG: false,
      originalEvent,
      scale: 2,
      x: 10,
      y: 0,
    });
  });

  test("an SVG element other than the root svg is SVG", () => {
    expect.hasAssertions();

    const parent = document.createElement("div");
    const group = createPanzoomContext(document.createElementNS(PANZOOM_SVG_NAMESPACE, "g"), parent);
    const root = createPanzoomContext(document.createElementNS(PANZOOM_SVG_NAMESPACE, "svg"), parent);

    expect(getPanzoomEventDetail(group).isSVG).toBe(true);
    expect(getPanzoomEventDetail(root).isSVG).toBe(false);
  });
});
