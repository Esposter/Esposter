import { getUuidV5 } from "#src/services/cutover/getUuidV5";
import { describe, expect, test } from "vitest";

describe(getUuidV5, () => {
  // The RFC 4122 appendix's own example: the DNS namespace and "www.example.com"
  test("derives the RFC 4122 example id for the DNS namespace", () => {
    expect.hasAssertions();

    expect(getUuidV5("6ba7b810-9dad-11d1-80b4-00c04fd430c8", "www.example.com")).toBe(
      "2ed6657d-e927-568b-95e1-2665a8aea6a2",
    );
  });
});
