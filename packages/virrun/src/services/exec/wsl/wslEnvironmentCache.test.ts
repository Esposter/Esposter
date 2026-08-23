import { createKeyedCacheSchema } from "#src/models/exec/KeyedCache";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME } from "#src/services/exec/util/constants";
import { readWslEnvironmentCache } from "#src/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "#src/services/exec/wsl/writeWslEnvironmentCache";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The generic miss/mismatch/corrupt matrix lives in readKeyedCache and the best-effort/atomic/mkdir behavior in
// WriteKeyedCache; here only the wiring, and the wiring is the pair agreeing on one Windows-side cache file for
// `filename` — so the reader and the writer share a suite rather than each asserting half a round-trip.
describe("wslEnvironmentCache", () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  const key = "linux:6.18.0";
  const value = "";

  test("returns undefined when no value has been persisted yet", () => {
    expect.hasAssertions();

    expect(readWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, z.string(), key)).toBeUndefined();
  });

  test("round-trips the value through the local cache file as validatable JSON", () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, { key, value });
    const content = readFileSync(join(getCacheHome(), WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME), "utf8");

    const { storedAtMs, ...cache } = createKeyedCacheSchema(z.string()).parse(jsonDateParse(content));

    expect(cache).toStrictEqual({ key, value });
    expect(storedAtMs).toBeTypeOf("number");
    expect(readWslEnvironmentCache(WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME, z.string(), key)).toBe(value);
  });
});
