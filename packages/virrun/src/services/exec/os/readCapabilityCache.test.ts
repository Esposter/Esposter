import { readCapabilityCache } from "@/services/exec/os/readCapabilityCache";
import { writeCapabilityCache } from "@/services/exec/os/writeCapabilityCache";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { CAPABILITY_CACHE_FILENAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readCapabilityCache, () => {
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

  test("returns undefined when no cache file exists yet", () => {
    expect.hasAssertions();

    expect(readCapabilityCache(key)).toBeUndefined();
  });

  test("returns the persisted verdict when the key matches", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, supported: true });

    expect(readCapabilityCache(key)).toBe(true);
  });

  test("returns undefined when the host key has changed", () => {
    expect.hasAssertions();

    writeCapabilityCache({ key, supported: true });

    expect(readCapabilityCache("linux:6.19.0")).toBeUndefined();
  });

  test("returns undefined on a corrupt cache file rather than throwing", () => {
    expect.hasAssertions();

    writeFileSync(join(cacheHome, CAPABILITY_CACHE_FILENAME), "{ not json");

    expect(readCapabilityCache(key)).toBeUndefined();
  });
});
