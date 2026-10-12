import { checkIsValidRange } from "#src/services/semver/checkIsValidRange";
import { describe, expect, test } from "vitest";

describe(checkIsValidRange, () => {
  test.each([
    ["1.0.0 - 2.0.0"],
    ["1 - 2"],
    ["1.0 - 2.0"],
    ["1.0.0"],
    [">=*"],
    [""],
    ["*"],
    [">=1.0.0"],
    [">1.0.0"],
    ["<=2.0.0"],
    ["1"],
    ["<2.0.0"],
    [">= 1.0.0"],
    [">=  1.0.0"],
    [">=   1.0.0"],
    ["> 1.0.0"],
    [">  1.0.0"],
    ["<=   2.0.0"],
    ["<= 2.0.0"],
    ["<=  2.0.0"],
    ["<    2.0.0"],
    ["<\t2.0.0"],
    [">=0.1.97"],
    ["0.1.20 || 1.2.4"],
    [">=0.2.3 || <0.0.1"],
    ["||"],
    ["2.x.x"],
    ["1.2.x"],
    ["1.2.x || 2.x"],
    ["x"],
    ["2.*.*"],
    ["1.2.*"],
    ["1.2.* || 2.*"],
    ["2"],
    ["2.3"],
    ["~2.4"],
    ["~>3.2.1"],
    ["~1"],
    ["~>1"],
    ["~> 1"],
    ["~1.0"],
    ["~ 1.0"],
    ["~1.x"],
    ["~1.2"],
    ["~1.2.x"],
    ["~0.0"],
    ["~1.2.3"],
    ["~1.2.3-beta.4"],
    ["^0"],
    ["^ 1"],
    ["^0.1"],
    ["^1.0"],
    ["^1.2"],
    ["^0.0.1"],
    ["^0.0.1-beta"],
    ["^0.1.2"],
    ["^1.2.3"],
    ["^1.2.3-beta.4"],
    ["<1"],
    ["< 1"],
    [">=1"],
    [">= 1"],
    ["<1.2"],
    ["< 1.2"],
    ["^ 1.2 ^ 1"],
    ["1.2 - 3.4.5"],
    ["1.2.3 - 3.4"],
    ["1.2 - 3.4"],
    [">1"],
    [">1.2"],
    [">X"],
    ["<X"],
    ["<x <* || >* 2.x"],
    [">x 2.x || * || <x"],
    ["1.x.x+build >2.x+build"],
    [">=1.x+build <2.x.x+build"],
    ["1.x.x+build || 2.x.x+build"],
    ["1.x+build.123"],
    ["1.x.x+meta-data"],
    ["1.x.x+build.123 >2.x.x+meta-data"],
    ["1.x.x+build <2.x.x+meta"],
    [">1.x+build <=2.x.x+meta"],
    [" 1.x.x+build   >2.x.x+build  "],
    ["^1.x+build"],
    ["^1.x.x+build"],
    ["^1.2.x+build"],
    ["^1.x+meta-data"],
    ["^1.x.x+build.123"],
    ["~1.x+build"],
    ["~1.x.x+build"],
    ["~1.2.x+build"],
    ["~1.x+meta-data"],
    ["~1.x.x+build.123"],
    ["^1.x.x+build || ~2.x.x+meta"],
    ["~1.x.x+build >2.x+meta"],
    ["^1.x+build.123 <2.x.x+meta-data"],
    ["1.x.x-alpha+build"],
    [">1.x.x-alpha+build"],
    [">=1.x.x-alpha+build <2.x.x+build"],
    ["1.x.x-alpha+build || 2.x.x+build"],
    [
      "v1.0+aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaax6",
    ],
    [
      "1.2.3+aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa - 2.0.0",
    ],
    [
      "> 1.2.3+aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ],
    [
      "~1.2.3+aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ],
    [
      "^1.2.3+aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ],
  ])("accepts %s", (range) => {
    expect.hasAssertions();

    expect(checkIsValidRange(range)).toBe(true);
  });

  test.each([
    ["1.*.5"],
    ["1.x.5 || 2.x"],
    ["x.1"],
    ["x.1.2"],
    ["x.x.1"],
    [">01.02.03"],
    ["~1.2.3beta"],
    [">=09090"],
    [">=09090-0"],
  ])("rejects %s", (range) => {
    expect.hasAssertions();

    expect(checkIsValidRange(range)).toBe(false);
  });

  test("rejects 1.x.5, a number after a wildcard (upstream #511)", () => {
    expect.hasAssertions();

    expect(checkIsValidRange("1.x.5")).toBe(false);
  });

  test("accepts ^1.x.5 and ~x.1, which a caret or tilde reads past their wildcard (upstream #511)", () => {
    expect.hasAssertions();

    expect(checkIsValidRange("^1.x.5")).toBe(true);
    expect(checkIsValidRange("~x.1")).toBe(true);
  });

  test("rejects ^0.4.24 && 0.4.24, since && is not range syntax (upstream #505)", () => {
    expect.hasAssertions();

    expect(checkIsValidRange("^0.4.24 && 0.4.24")).toBe(false);
  });

  test.each(["npm:a@5x", "5x", "latest", "file:a", "git+https://github.com/a/b", "workspace:*"])(
    "rejects the specifier %s as a range",
    (range) => {
      expect.hasAssertions();

      expect(checkIsValidRange(range)).toBe(false);
    },
  );
});
