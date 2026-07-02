import { keyedStringCacheSchema } from "@/models/exec/KeyedStringCache";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY, WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeWslEnvironmentCache, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const key = "linux:6.18.0";
  const value = "";
  let cacheHome = "";

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("persists the value as validatable JSON in the local cache", () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value });
    const content = readFileSync(join(cacheHome, WSL_LOGIN_PATH_CACHE_FILENAME), "utf8");

    expect(keyedStringCacheSchema.parse(JSON.parse(content))).toStrictEqual({ key, value });
  });

  test("creates the cache directory when it does not yet exist", () => {
    expect.hasAssertions();

    const nestedCacheHome = join(cacheHome, TEST_FILENAME, TEST_FILENAME);
    process.env[VIRRUN_CACHE_HOME_KEY] = nestedCacheHome;
    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value });

    expect(JSON.parse(readFileSync(join(nestedCacheHome, WSL_LOGIN_PATH_CACHE_FILENAME), "utf8"))).toStrictEqual({
      key,
      value,
    });
  });
});
