import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { getLocalCacheDirectory } from "#src/services/exec/util/getLocalCacheDirectory";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(getLocalCacheDirectory, () => {
  const customCache = join(homedir(), TEST_FILENAME);

  test("defaults to the same-OS ~/.virrun on every platform", () => {
    expect.hasAssertions();

    vi.stubEnv(VIRRUN_CACHE_HOME_KEY, undefined);

    expect(getLocalCacheDirectory()).toBe(join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME));
  });

  test("honors the VIRRUN_CACHE_HOME override", () => {
    expect.hasAssertions();

    vi.stubEnv(VIRRUN_CACHE_HOME_KEY, customCache);

    expect(getLocalCacheDirectory()).toBe(customCache);
  });
});
