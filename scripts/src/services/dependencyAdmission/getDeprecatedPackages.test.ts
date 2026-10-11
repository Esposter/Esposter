import { getDeprecatedPackages } from "#src/services/dependencyAdmission/getDeprecatedPackages";
import { describe, expect, test } from "vitest";

describe(getDeprecatedPackages, () => {
  test("maps each deprecated package key to its message, and ignores entries npm did not deprecate", () => {
    expect.hasAssertions();

    expect(
      getDeprecatedPackages(
        "packages:\n\n  a@1.0.0:\n    resolution: {integrity: x}\n    deprecated: Gone for good.\n\n  b@1.0.0:\n    resolution: {integrity: y}\n",
      ),
    ).toStrictEqual(new Map([["a@1.0.0", "Gone for good."]]));
  });
});
