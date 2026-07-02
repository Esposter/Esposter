import { capabilityCacheSchema } from "@/models/exec/os/CapabilityCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { CAPABILITY_CACHE_FILENAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeCapabilityCache, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const key = "linux:6.18.0";
  let cacheHome = "";

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("persists the verdict as validatable JSON in the global cache", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, supported: true });
    const content = readFileSync(join(cacheHome, CAPABILITY_CACHE_FILENAME), "utf8");

    expect(capabilityCacheSchema.parse(JSON.parse(content))).toStrictEqual({ key, supported: true });
  });

  test("creates the cache directory when it does not yet exist", () => {
    expect.hasAssertions();

    const nestedCacheHome = join(cacheHome, "does", "not", "exist");
    process.env[VIRRUN_CACHE_HOME_KEY] = nestedCacheHome;
    writeCapabilityCache({ key, supported: false });

    expect(JSON.parse(readFileSync(join(nestedCacheHome, CAPABILITY_CACHE_FILENAME), "utf8"))).toStrictEqual({
      key,
      supported: false,
    });
  });
});
