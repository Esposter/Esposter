import { createKeyedCacheSchema } from "@/models/exec/KeyedCache";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The generic best-effort/atomic/mkdir behavior lives in writeKeyedCache; here only the wiring — the value lands in
// The Windows-side cache file for `filename`.
describe(writeWslEnvironmentCache, () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  const key = "linux:6.18.0";
  const value = "";

  test("persists the value as validatable JSON in the local cache", () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value });
    const content = readFileSync(join(getCacheHome(), WSL_LOGIN_PATH_CACHE_FILENAME), "utf8");

    expect(createKeyedCacheSchema(z.string()).parse(JSON.parse(content))).toStrictEqual({ key, value });
  });
});
