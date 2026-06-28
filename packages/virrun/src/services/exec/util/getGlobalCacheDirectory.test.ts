import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(getGlobalCacheDirectory, () => {
  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
  });

  test("defaults to ~/.virrun", () => {
    expect.hasAssertions();

    delete process.env[VIRRUN_CACHE_HOME_KEY];

    expect(getGlobalCacheDirectory()).toBe(join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME));
  });

  test("honors the VIRRUN_CACHE_HOME override", () => {
    expect.hasAssertions();

    process.env[VIRRUN_CACHE_HOME_KEY] = join(homedir(), "custom-cache");

    expect(getGlobalCacheDirectory()).toBe(join(homedir(), "custom-cache"));
  });
});
