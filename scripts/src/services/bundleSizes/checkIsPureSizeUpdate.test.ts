import type { BundleSize } from "#src/models/bundleSizes/BundleSize";

import { checkIsPureSizeUpdate } from "#src/services/bundleSizes/checkIsPureSizeUpdate";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(checkIsPureSizeUpdate, () => {
  const packageName = "@esposter/shared";
  const previous: BundleSize[] = [
    { bytes: 100, file: "index.js", packageName },
    { bytes: 200, file: "**/*.js", packageName },
  ];

  test("the same rows at other sizes is a pure size update", () => {
    expect.hasAssertions();

    expect(
      checkIsPureSizeUpdate(previous, [
        { bytes: 150, file: "index.js", packageName },
        { bytes: 180, file: "**/*.js", packageName },
      ]),
    ).toBe(true);
  });

  test("the same rows in another order is a pure size update", () => {
    expect.hasAssertions();

    expect(checkIsPureSizeUpdate(previous, [...previous].toReversed())).toBe(true);
  });

  test.each([
    ["a row gained", [...previous, { bytes: 1, file: "**/*.d.ts", packageName }]],
    ["a row lost", [takeOne(previous, 0)]],
    ["a row renamed", [takeOne(previous, 0), { bytes: 200, file: "models/**/*.js", packageName }]],
    [
      "a row moved to another package",
      [takeOne(previous, 0), { bytes: 200, file: "**/*.js", packageName: "@esposter/db" }],
    ],
  ])("%s is not a pure size update", (_description, next) => {
    expect.hasAssertions();

    expect(checkIsPureSizeUpdate(previous, next)).toBe(false);
  });
});
