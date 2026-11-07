import { checkIsStampPath } from "#src/services/fleet/data/checkIsStampPath";
import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { describe, expect, test } from "vitest";

describe(checkIsStampPath, () => {
  test("refuses a backslash path that climbs out of the parity directory", () => {
    expect.hasAssertions();

    const CLIMBING_PATH = `..\\..\\a${PROVENANCE_SIDECAR_SUFFIX}`;

    expect(checkIsStampPath(CLIMBING_PATH)).toBe(false);
  });

  test("accepts a backslash path that stays inside the parity directory", () => {
    expect.hasAssertions();

    const INSIDE_PATH = `a\\${PROVENANCE_NAME}`;

    expect(checkIsStampPath(INSIDE_PATH)).toBe(true);
  });
});
