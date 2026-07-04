import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { describe, expect, test } from "vitest";

// The generic miss/mismatch/corrupt matrix lives in readKeyedCache; here only the wiring — the value round-trips
// Through the Windows-side cache file for `filename`.
describe(readWslEnvironmentCache, () => {
  setupTemporaryCacheHome();
  const key = "linux:6.18.0";
  const value = "";

  test("returns undefined when no value has been persisted yet", () => {
    expect.hasAssertions();

    expect(readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, key)).toBeUndefined();
  });

  test("returns the persisted value when the key matches", () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value });

    expect(readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, key)).toBe(value);
  });
});
