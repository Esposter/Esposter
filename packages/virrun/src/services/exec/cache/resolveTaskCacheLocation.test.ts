import {
  TASK_CACHE_META_FILENAME,
  TASK_CACHE_PAYLOAD_DIRECTORY_NAME,
  VIRRUN_TASKS_DIRECTORY_NAME,
} from "@/services/exec/cache/constants";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(resolveTaskCacheLocation, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const key = "key";
  let cacheHome = "";

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("addresses the entry under tasks/<key> with its meta file and payload dir", () => {
    expect.hasAssertions();

    const location = resolveTaskCacheLocation(key);
    const expectedDir = join(cacheHome, VIRRUN_TASKS_DIRECTORY_NAME, key);

    expect(location.dir).toBe(expectedDir);
    expect(location.metaFile).toBe(join(expectedDir, TASK_CACHE_META_FILENAME));
    expect(location.payloadDir).toBe(join(expectedDir, TASK_CACHE_PAYLOAD_DIRECTORY_NAME));
  });

  test("exists only once the meta file has been written", () => {
    expect.hasAssertions();

    expect(resolveTaskCacheLocation(key).exists).toBe(false);

    const { dir } = resolveTaskCacheLocation(key);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, TASK_CACHE_META_FILENAME), "{}");

    expect(resolveTaskCacheLocation(key).exists).toBe(true);
  });
});
