import { mapWorkspaceSiblingPath } from "#src/services/mapWorkspaceSiblingPath";
import { describe, expect, test } from "vitest";

describe(mapWorkspaceSiblingPath, () => {
  test.each([
    [
      "a sibling's module",
      "Desktop/Software/checkout/packages/shared/dist/util/array/takeOne",
      "vendor/shared/util/array/takeOne",
    ],
    ["the package's own module", "constants", "constants"],
  ])("maps %s to its vendored path", (_name, input, expected) => {
    expect.hasAssertions();

    expect(mapWorkspaceSiblingPath(input)).toBe(expected);
  });
});
