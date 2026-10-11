import { REPAIR_FAILED_MARKER } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { describe, expect, test } from "vitest";

describe(getMarker, () => {
  // A red's attempts are recorded on whichever head was red, so the marker names the signature they share
  test("keys a failure signature by its digest", () => {
    expect.hasAssertions();

    const signature = getFailureSignature("", []);

    expect(getMarker(REPAIR_FAILED_MARKER, signature)).toBe(
      `<!-- ${REPAIR_FAILED_MARKER} signature:${signature.hash} -->`,
    );
  });
});
