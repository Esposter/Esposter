import { PackageFormat } from "#src/models/dependencies/score/PackageFormat";
import { getFormatPoints } from "#src/services/dependencies/score/getFormatPoints";
import { describe, expect, test } from "vitest";

describe(getFormatPoints, () => {
  test.each([
    [PackageFormat.Commonjs, 20],
    [PackageFormat.Dual, 10],
    [PackageFormat.Esm, 0],
    [PackageFormat.Types, 0],
  ])("%s scores %s", (format, points) => {
    expect.hasAssertions();

    expect(getFormatPoints(format)).toBe(points);
  });
});
