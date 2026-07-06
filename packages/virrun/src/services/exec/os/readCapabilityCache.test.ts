import { readCapabilityCache } from "@/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { describe, expect, test } from "vitest";

// The generic miss/mismatch/corrupt matrix lives in readKeyedCache; here only the wiring — the verdict round-trips
// Through the host-global capability cache file.
describe(readCapabilityCache, () => {
  setupTemporaryCacheHome();
  const key = "linux:6.18.0";

  test("returns undefined when no verdict has been persisted yet", () => {
    expect.hasAssertions();

    expect(readCapabilityCache(key)).toBeUndefined();
  });

  test("returns the persisted verdict when the key matches", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, value: true });

    expect(readCapabilityCache(key)).toBe(true);
  });
});
