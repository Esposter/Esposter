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

  test("#504 and #577 floor the scale at the fit under automatic containment", () => {
    expect.hasAssertions();

    const wideMeasure = {
      center: { x: 100, y: 100 },
      parent: { height: 200, left: 0, top: 0, width: 200 },
      size: { height: 200, width: 400 },
    };
    const smallParentMeasure = { ...wideMeasure, parent: { height: 100, left: 0, top: 0, width: 100 } };

    expect(constrainPanzoomScale(0.1, wideMeasure, { contain: PanzoomContain.Automatic })).toBe(0.5);
    expect(constrainPanzoomScale(0.1, smallParentMeasure, { contain: PanzoomContain.Automatic })).toBe(0.25);
  });

  test("inside caps the scale at the fit but no lower than the minimum scale, as automatic does", () => {
    expect.hasAssertions();

    const wideMeasure = {
      center: { x: 500, y: 50 },
      parent: { height: 100, left: 0, top: 0, width: 100 },
      size: { height: 100, width: 1000 },
    };

    expect(constrainPanzoomScale(0.05, wideMeasure, { contain: PanzoomContain.Inside })).toBe(0.125);
    expect(constrainPanzoomScale(0.05, wideMeasure, { contain: PanzoomContain.Automatic })).toBe(0.125);
  });

  test("a parent with a collapsed side contains on its other axis alone, so the fit there caps the scale", () => {
    expect.hasAssertions();

    const collapsedMeasure = {
      center: { x: 100, y: 50 },
      parent: { height: 0, left: 0, top: 0, width: 200 },
      size: { height: 100, width: 100 },
    };

    expect(constrainPanzoomScale(3, collapsedMeasure, { contain: PanzoomContain.Inside })).toBe(2);
  });

  test("a parent with no side to contain in leaves the scale to the limits alone", () => {
    expect.hasAssertions();

    const zeroMeasure = {
      center: { x: 50, y: 50 },
      parent: { height: 0, left: 0, top: 0, width: 0 },
      size: { height: 100, width: 100 },
    };

    expect(constrainPanzoomScale(3, zeroMeasure, { contain: PanzoomContain.Inside })).toBe(3);
  });
});
