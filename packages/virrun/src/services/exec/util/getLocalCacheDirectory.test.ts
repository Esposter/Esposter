import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(getLocalCacheDirectory, () => {
  const customCache = join(homedir(), TEST_FILENAME);

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
  });

  test("defaults to the same-OS ~/.virrun on every platform", () => {
    expect.hasAssertions();

    delete process.env[VIRRUN_CACHE_HOME_KEY];

    expect(getLocalCacheDirectory()).toBe(join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME));
  });

  test("honors the VIRRUN_CACHE_HOME override", () => {
    expect.hasAssertions();

    process.env[VIRRUN_CACHE_HOME_KEY] = customCache;

    expect(getLocalCacheDirectory()).toBe(customCache);
  });
});
