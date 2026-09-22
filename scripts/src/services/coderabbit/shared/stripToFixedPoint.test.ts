import { stripToFixedPoint } from "#src/services/coderabbit/shared/stripToFixedPoint";
import { describe, expect, test } from "vitest";

describe(stripToFixedPoint, () => {
  const regex = /ab/gu;

  test("strips the match one pass leaves behind", () => {
    expect.hasAssertions();

    expect(stripToFixedPoint("aabb", regex)).toBe("");
  });

  test("returns the text itself when nothing matches", () => {
    expect.hasAssertions();

    const text = "ba";

    expect(stripToFixedPoint(text, regex)).toBe(text);
  });
});
