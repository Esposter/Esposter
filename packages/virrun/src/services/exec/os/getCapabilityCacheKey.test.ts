import { getCapabilityCacheKey } from "@/services/exec/os/getCapabilityCacheKey";
import { release } from "node:os";
import { describe, expect, test } from "vitest";

describe(getCapabilityCacheKey, () => {
  test("fingerprints the host as platform:release", () => {
    expect.hasAssertions();

    expect(getCapabilityCacheKey()).toBe(`${process.platform}:${release()}`);
  });

  test("is stable across calls within a host", () => {
    expect.hasAssertions();

    expect(getCapabilityCacheKey()).toBe(getCapabilityCacheKey());
  });
});
