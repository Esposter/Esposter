import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { describe, expect, test } from "vitest";

describe(constrainPanzoomScale, () => {
  // A 100 by 100 element in a 200 by 100 parent fits at scale 1 and covers at scale 2
  const measure = {
    center: { x: 100, y: 50 },
    parent: { height: 100, left: 0, top: 0, width: 200 },
    size: { height: 100, width: 100 },
  };

  test("the limits clamp a scale that no containment applies to", () => {
    expect.hasAssertions();

    expect(constrainPanzoomScale(5, measure, {})).toBe(4);
    expect(constrainPanzoomScale(0.05, measure, {})).toBe(0.125);
  });

  test("inside caps the scale at the fit and outside floors it at the cover", () => {
    expect.hasAssertions();

    expect(constrainPanzoomScale(3, measure, { contain: PanzoomContain.Inside })).toBe(1);
    expect(constrainPanzoomScale(1.5, measure, { contain: PanzoomContain.Outside })).toBe(2);
  });

  test("an element a pixel or less on a side has no containment scale", () => {
    expect.hasAssertions();

    const thinMeasure = { ...measure, size: { height: 100, width: 1 } };

    expect(constrainPanzoomScale(3, thinMeasure, { contain: PanzoomContain.Inside })).toBe(3);
  });
});
