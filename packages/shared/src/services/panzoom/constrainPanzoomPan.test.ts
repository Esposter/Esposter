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
});
