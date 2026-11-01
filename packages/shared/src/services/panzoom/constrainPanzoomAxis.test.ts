import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { constrainPanzoomAxis } from "#src/services/panzoom/constrainPanzoomAxis";
import { describe, expect, test } from "vitest";

describe(constrainPanzoomAxis, () => {
  const centredAxis = { center: 100, length: 100, parentLength: 200, parentStart: 0 };
  const largerAxis = { center: 200, length: 400, parentLength: 200, parentStart: 0 };

  test("an axis without containment takes the value as requested", () => {
    expect.hasAssertions();

    expect(constrainPanzoomAxis(-500, centredAxis, 1)).toBe(-500);
  });

  test("inside keeps the element between its parent's edges", () => {
    expect.hasAssertions();

    expect(constrainPanzoomAxis(-500, centredAxis, 1, PanzoomContain.Inside)).toBe(-50);
    expect(constrainPanzoomAxis(500, centredAxis, 1, PanzoomContain.Inside)).toBe(50);
  });

  test("outside keeps the element covering its parent's edges", () => {
    expect.hasAssertions();

    expect(constrainPanzoomAxis(-1000, largerAxis, 1, PanzoomContain.Outside)).toBe(-200);
    expect(constrainPanzoomAxis(1000, largerAxis, 1, PanzoomContain.Outside)).toBe(0);
  });

  test("automatic is inside on an axis the element fits and outside on one it overflows", () => {
    expect.hasAssertions();

    expect(constrainPanzoomAxis(-500, centredAxis, 1, PanzoomContain.Automatic)).toBe(-50);
    expect(constrainPanzoomAxis(-1000, largerAxis, 1, PanzoomContain.Automatic)).toBe(-200);
  });

  test("inside pins an element larger than its parent to the leading edge", () => {
    expect.hasAssertions();

    expect(constrainPanzoomAxis(-500, largerAxis, 1, PanzoomContain.Inside)).toBe(0);
  });

  test("an axis whose parent has a collapsed side has no containment, so the value stands", () => {
    expect.hasAssertions();

    const collapsedAxis = { center: 100, length: 100, parentLength: 0, parentStart: 0 };

    expect(constrainPanzoomAxis(-500, collapsedAxis, 1, PanzoomContain.Inside)).toBe(-500);
  });
});
