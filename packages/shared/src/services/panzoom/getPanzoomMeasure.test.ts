// @vitest-environment happy-dom
import { getPanzoomMeasure } from "#src/services/panzoom/getPanzoomMeasure";
import { stubPanzoomLayout } from "#src/services/panzoom/stubPanzoomLayout.test";
import { stubPanzoomParent } from "#src/services/panzoom/stubPanzoomParent.test";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getPanzoomMeasure, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("the layout centre is the rectangle's centre less the scaled pan, and the size is the rectangle over the scale", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const parent = document.createElement("div");
    element.style.transform = "scale(2) translate(10px, 0px)";
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(parent, { height: 200, left: 0, top: 0, width: 300 });

    expect(getPanzoomMeasure(element, parent, { scale: 2, x: 10, y: 0 })).toStrictEqual({
      center: { x: 50, y: 50 },
      parent: { height: 200, left: 0, top: 0, width: 300 },
      size: { height: 100, width: 100 },
    });
  });

  test("the parent's content box is its rectangle less its border and padding", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const parent = document.createElement("div");
    stubPanzoomLayout(element, { height: 100, left: 0, top: 0, width: 100 });
    stubPanzoomParent(parent, { height: 200, left: 0, top: 0, width: 300 }, { border: 5, padding: 10 });

    expect(getPanzoomMeasure(element, parent, { scale: 1, x: 0, y: 0 }).parent).toStrictEqual({
      height: 170,
      left: 15,
      top: 15,
      width: 270,
    });
  });
});
