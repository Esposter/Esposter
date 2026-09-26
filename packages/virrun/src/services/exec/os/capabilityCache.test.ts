import { createKeyedCacheSchema } from "#src/models/exec/KeyedCache";
import { readCapabilityCache } from "#src/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "#src/services/exec/os/writeCapabilityCache";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { CAPABILITY_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import { z } from "zod";

const location = vi.hoisted(() => ({ isUnresolved: false }));
// On win32 the location is asked of WSL; a VM that will not start throws from here
vi.mock(import("#src/services/exec/os/getCapabilityCachePath"), async (importOriginal) => {
  const { getCapabilityCachePath } = await importOriginal();
  return {
    getCapabilityCachePath: () => {
      if (location.isUnresolved) throw new InvalidOperationError(Operation.Read, getCapabilityCachePath.name, " ");
      return getCapabilityCachePath();
    },
  };
});

// The generic miss/mismatch/corrupt matrix lives in readKeyedCache and the best-effort/atomic/mkdir behavior in
// `writeKeyedCache`; here only the wiring, and the wiring is the pair agreeing on one host-global cache file — so the
// Reader and the writer share a suite rather than each asserting half a round-trip.
describe("capabilityCache", () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  const key = "key";

  test("returns undefined when no verdict has been persisted yet", () => {
    expect.hasAssertions();

    expect(readCapabilityCache(key)).toBeUndefined();
  });

  test("round-trips the verdict through the global cache file as validatable JSON", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, value: true });
    const content = readFileSync(join(getCacheHome(), CAPABILITY_CACHE_FILENAME), "utf8");

    const { storedAtMs, ...cache } = createKeyedCacheSchema(z.boolean()).parse(jsonDateParse(content));

    expect(cache).toStrictEqual({ key, value: true });
    expect(storedAtMs).toBeTypeOf("number");
    expect(readCapabilityCache(key)).toBe(true);
  });

  test("misses and skips the write when the location cannot be resolved", () => {
    expect.hasAssertions();

    location.isUnresolved = true;
    onTestFinished(() => {
      location.isUnresolved = false;
    });

    expect(() => {
      writeCapabilityCache({ key, value: true });
    }).not.toThrow();
    expect(readCapabilityCache(key)).toBeUndefined();
  });
});
