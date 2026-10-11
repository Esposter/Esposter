import { getExtensionMimeTypeMap } from "#src/services/mime/getExtensionMimeTypeMap";
import { describe, expect, test } from "vitest";

describe(getExtensionMimeTypeMap, () => {
  // Each extension here is claimed by several types, and the one mime-score ranks highest keeps it
  test.each([
    { expected: "video/mp4", extension: "mp4" },
    { expected: "video/mp4", extension: "mpg4" },
    { expected: "audio/aac", extension: "aac" },
    { expected: "audio/wav", extension: "wav" },
    { expected: "text/javascript", extension: "js" },
    { expected: "application/x-msdos-program", extension: "exe" },
  ])("maps $extension to $expected over its other claimants", ({ expected, extension }) => {
    expect.hasAssertions();
    expect(getExtensionMimeTypeMap().get(extension)).toBe(expected);
  });

  test("keeps application/octet-stream for an extension nothing else claims", () => {
    expect.hasAssertions();
    expect(getExtensionMimeTypeMap().get("bin")).toBe("application/octet-stream");
  });
});
