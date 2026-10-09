import { EXPRESS_FAILED_MARKER, REPAIR_FAILED_MARKER } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { describe, expect, test } from "vitest";

describe(getMarker, () => {
  // A claim's attempts are recorded on whichever sha the queue's rewrites gave it, so the marker names the patch they
  // Share
  test("keys a commit's patch by its patch id", () => {
    expect.hasAssertions();

    const patchId = "patchId";

    expect(getMarker(EXPRESS_FAILED_MARKER, { patchId })).toBe(`<!-- ${EXPRESS_FAILED_MARKER} patch:${patchId} -->`);
  });

  // A red's attempts are recorded on whichever head was red, so the marker names the signature they share
  test("keys a failure signature by its digest", () => {
    expect.hasAssertions();

    const signature = getFailureSignature("", []);

    expect(getMarker(REPAIR_FAILED_MARKER, signature)).toBe(
      `<!-- ${REPAIR_FAILED_MARKER} signature:${signature.hash} -->`,
    );
  });
});
