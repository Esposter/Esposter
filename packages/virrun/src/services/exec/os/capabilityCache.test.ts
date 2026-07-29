import { createKeyedCacheSchema } from "@/models/exec/KeyedCache";
import { readCapabilityCache } from "@/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { CAPABILITY_CACHE_FILENAME } from "@/services/exec/util/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The generic miss/mismatch/corrupt matrix lives in readKeyedCache and the best-effort/atomic/mkdir behavior in
// WriteKeyedCache; here only the wiring, and the wiring is the pair agreeing on one host-global cache file — so the
// Reader and the writer share a suite rather than each asserting half a round-trip.
describe("capabilityCache", () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  const key = "linux:6.18.0";

  test("returns undefined when no verdict has been persisted yet", () => {
    expect.hasAssertions();

    expect(readCapabilityCache(key)).toBeUndefined();
  });

  test("round-trips the verdict through the global cache file as validatable JSON", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, value: true });
    const content = readFileSync(join(getCacheHome(), CAPABILITY_CACHE_FILENAME), "utf8");

    const { storedAtMs, ...cache } = createKeyedCacheSchema(z.boolean()).parse(JSON.parse(content));

    expect(cache).toStrictEqual({ key, value: true });
    expect(storedAtMs).toBeTypeOf("number");
    expect(readCapabilityCache(key)).toBe(true);
  });
});
