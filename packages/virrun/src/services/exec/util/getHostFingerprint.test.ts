import { getHostFingerprint } from "@/services/exec/util/getHostFingerprint";
import { release } from "node:os";
import { describe, expect, test } from "vitest";

describe(getHostFingerprint, () => {
  test("fingerprints the host as platform:release", () => {
    expect.hasAssertions();

    expect(getHostFingerprint()).toBe(`${process.platform}:${release()}`);
  });

  test("is stable across calls within a host", () => {
    expect.hasAssertions();

    expect(getHostFingerprint()).toBe(getHostFingerprint());
  });
});
