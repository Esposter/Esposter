import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { constrainPanzoomPan } from "#src/services/panzoom/constrainPanzoomPan";
import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { describe, expect, test } from "vitest";

describe(constrainPanzoomPan, () => {
  const measure = {
    center: { x: 100, y: 100 },
    parent: { height: 200, left: 0, top: 0, width: 200 },
    size: { height: 100, width: 100 },
  };

  test("#102 contains automatically: inside at scale 1, and outside once zoomed past the parent", () => {
    expect.hasAssertions();

    const elementMeasure = {
      center: { x: 50, y: 50 },
      parent: { height: 100, left: 0, top: 0, width: 200 },
      size: { height: 100, width: 100 },
    };
    const current = { scale: 1, x: 0, y: 0 };

    expect(
      constrainPanzoomPan(current, { x: 500, y: 0 }, 1, elementMeasure, { contain: PanzoomContain.Automatic }),
    ).toStrictEqual({ x: 100, y: 0 });
    expect(
      constrainPanzoomPan(current, { x: 500, y: 0 }, 3, elementMeasure, { contain: PanzoomContain.Automatic }).x,
    ).toBeCloseTo(33.3333, 3);
  });

  test("#511 #598 and #707 contain an element that fits at the parent's leading edge and one that overflows at its covering pan", () => {
    expect.hasAssertions();

    const fittingMeasure = {
      center: { x: 50, y: 50 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 100, width: 100 },
    };
    const overflowingMeasure = {
      center: { x: 200, y: 200 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 400, width: 400 },
    };
    const current = { scale: 1, x: 0, y: 0 };

    expect(
      constrainPanzoomPan(current, { x: -1000, y: -1000 }, 1, fittingMeasure, { contain: PanzoomContain.Automatic }),
    ).toStrictEqual({ x: 0, y: 0 });
    expect(
      constrainPanzoomPan(current, { x: -1000, y: -1000 }, 1, overflowingMeasure, {
        contain: PanzoomContain.Automatic,
      }),
    ).toStrictEqual({ x: -200, y: -200 });
  });

  test("#583 contains each axis on its own, outside where the element overflows and inside where it fits", () => {
    expect.hasAssertions();

    const perAxisMeasure = {
      center: { x: 200, y: 25 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 50, width: 400 },
    };

    expect(
      constrainPanzoomPan({ scale: 1, x: 0, y: 0 }, { x: -1000, y: -1000 }, 1, perAxisMeasure, {
        contain: PanzoomContain.Automatic,
      }),
    ).toStrictEqual({ x: -200, y: 0 });
  });

  test("#614 keeps a flex-centred element covering its parent at its own layout offset", () => {
    expect.hasAssertions();

    const flexCentredMeasure = {
      center: { x: 150, y: 100 },
      parent: { height: 200, left: 0, top: 0, width: 300 },
      size: { height: 200, width: 400 },
    };

    expect(
      constrainPanzoomPan({ scale: 1, x: 0, y: 0 }, { x: -1000, y: 0 }, 1, flexCentredMeasure, {
        contain: PanzoomContain.Outside,
      }),
    ).toStrictEqual({ x: -50, y: 0 });
  });

  test("#708 and #709 clamp a reset's pan against the scale the reset applies, in one step", () => {
    expect.hasAssertions();

    const containedMeasure = {
      center: { x: 200, y: 200 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 400, width: 400 },
    };
    const resetScale = constrainPanzoomScale(1, containedMeasure, { contain: PanzoomContain.Outside });

    expect(
      constrainPanzoomPan({ scale: 2, x: 0, y: 0 }, { x: -1000, y: 0 }, resetScale, containedMeasure, {
        contain: PanzoomContain.Outside,
        force: true,
      }),
    ).toStrictEqual({ x: -200, y: 0 });
  });

  test("a disabled pan holds the current pan unless the call forces it", () => {
    expect.hasAssertions();

    const current = { scale: 1, x: 10, y: 20 };

    expect(constrainPanzoomPan(current, { x: 50, y: 50 }, 1, measure, { disablePan: true })).toStrictEqual({
      x: 10,
      y: 20,
    });
    expect(constrainPanzoomPan(current, { x: 50, y: 50 }, 1, measure, { panOnlyWhenZoomed: true })).toStrictEqual({
      x: 10,
      y: 20,
    });
    expect(constrainPanzoomPan(current, { x: 50, y: 50 }, 1, measure, { disablePan: true, force: true })).toStrictEqual(
      { x: 50, y: 50 },
    );
  });

  test("relative offsets move from the current pan, and a disabled axis holds it", () => {
    expect.hasAssertions();

    expect(
      constrainPanzoomPan({ scale: 1, x: 10, y: 20 }, { x: 5, y: 5 }, 1, measure, {
        disableXAxis: true,
        relative: true,
      }),
    ).toStrictEqual({ x: 10, y: 25 });
  });

  test("roundPixels rounds the pan to whole pixels", () => {
    expect.hasAssertions();

    expect(
      constrainPanzoomPan({ scale: 1, x: 0, y: 0 }, { x: 0.4, y: 0.6 }, 1, measure, { roundPixels: true }),
    ).toStrictEqual({ x: 0, y: 1 });
  });

  test("roundPixels rounds before containment, so a pan held between bounds half a pixel apart lands on the bound", () => {
    expect.hasAssertions();

    const pinnedMeasure = {
      center: { x: 50.5, y: 50 },
      parent: { height: 100, left: 0, top: 0, width: 100 },
      size: { height: 100, width: 100 },
    };

    expect(
      constrainPanzoomPan({ scale: 1, x: 0, y: 0 }, { x: 0, y: 0 }, 1, pinnedMeasure, {
        contain: PanzoomContain.Inside,
        roundPixels: true,
      }),
    ).toStrictEqual({ x: -0.5, y: 0 });
  });

  test("panOnlyWhenZoomed holds the pan at a start scale the limits clamp to, since that is the start state", () => {
    expect.hasAssertions();

    expect(
      constrainPanzoomPan({ scale: 0.125, x: 0, y: 0 }, { x: 50, y: 50 }, 0.125, measure, {
        panOnlyWhenZoomed: true,
        startScale: 0.05,
      }),
    ).toStrictEqual({ x: 0, y: 0 });
  });
});
