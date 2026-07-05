import { createKeyedCacheSchema } from "@/models/exec/KeyedCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { CAPABILITY_CACHE_FILENAME } from "@/services/exec/util/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The generic best-effort/atomic/mkdir behavior lives in writeKeyedCache; here only the wiring — the verdict lands
// In the host-global capability cache file.
describe(writeCapabilityCache, () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  const key = "linux:6.18.0";

  test("persists the verdict as validatable JSON in the global cache", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, value: true });
    const content = readFileSync(join(getCacheHome(), CAPABILITY_CACHE_FILENAME), "utf8");

    expect(createKeyedCacheSchema(z.boolean()).parse(JSON.parse(content))).toStrictEqual({ key, value: true });
  });
});
