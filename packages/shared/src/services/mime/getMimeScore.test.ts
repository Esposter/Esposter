import { getMimeScore } from "#src/services/mime/getMimeScore";
import { describe, expect, test } from "vitest";

describe(getMimeScore, () => {
  test("scores application/octet-stream at zero, so any other type claims an extension from it", () => {
    expect.hasAssertions();
    expect(getMimeScore("application/octet-stream")).toBe(0);
  });

  test("prefers video/mp4 over application/mp4", () => {
    expect.hasAssertions();
    expect(getMimeScore("video/mp4", "iana")).toBeGreaterThan(getMimeScore("application/mp4", "iana"));
  });

  test("prefers application/xml over text/xml", () => {
    expect.hasAssertions();
    expect(getMimeScore("application/xml", "iana")).toBeGreaterThan(getMimeScore("text/xml", "iana"));
  });

  test("prefers an IANA type over an apache one, and an apache one over an nginx one", () => {
    expect.hasAssertions();
    expect(getMimeScore("text/plain", "iana")).toBeGreaterThan(getMimeScore("text/plain", "apache"));
    expect(getMimeScore("text/plain", "apache")).toBeGreaterThan(getMimeScore("text/plain", "nginx"));
  });

  test("prefers the unprefixed facet over an x- one", () => {
    expect.hasAssertions();
    expect(getMimeScore("audio/aac", "iana")).toBeGreaterThan(getMimeScore("audio/x-aac", "apache"));
  });
});
