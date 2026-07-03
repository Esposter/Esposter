import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY, WSL_LOGIN_PATH_CACHE_FILENAME } from "@/services/exec/util/constants";
import { readWslEnvironmentCache } from "@/services/exec/wsl/readWslEnvironmentCache";
import { writeWslEnvironmentCache } from "@/services/exec/wsl/writeWslEnvironmentCache";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readWslEnvironmentCache, () => {
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

  test("returns undefined when no cache file exists yet", () => {
    expect.hasAssertions();

    expect(readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, key)).toBeUndefined();
  });

  test("returns the persisted value when the key matches", () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value });

    expect(readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, key)).toBe(value);
  });

  test("returns undefined when the host key has changed", () => {
    expect.hasAssertions();

    writeWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, { key, value });

    expect(readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, "linux:6.19.0")).toBeUndefined();
  });

  test("returns undefined on a corrupt cache file rather than throwing", () => {
    expect.hasAssertions();

    writeFileSync(join(cacheHome, WSL_LOGIN_PATH_CACHE_FILENAME), "{ not json");

    expect(readWslEnvironmentCache(WSL_LOGIN_PATH_CACHE_FILENAME, key)).toBeUndefined();
  });
});
