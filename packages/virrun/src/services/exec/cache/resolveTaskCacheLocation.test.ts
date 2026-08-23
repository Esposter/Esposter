import {
  TASK_CACHE_META_FILENAME,
  TASK_CACHE_PAYLOAD_DIRECTORY_NAME,
  VIRRUN_TASKS_DIRECTORY_NAME,
} from "#src/services/exec/cache/constants";
import { resolveTaskCacheLocation } from "#src/services/exec/cache/resolveTaskCacheLocation";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(resolveTaskCacheLocation, () => {
  const { getCacheHome } = setupTemporaryCacheHome();
  const key = "key";

  test("addresses the entry under tasks/<key> with its meta file and payload dir", () => {
    expect.hasAssertions();

    const location = resolveTaskCacheLocation(key);
    const expectedDirectory = join(getCacheHome(), VIRRUN_TASKS_DIRECTORY_NAME, key);

    expect(location.dir).toBe(expectedDirectory);
    expect(location.metaFile).toBe(join(expectedDirectory, TASK_CACHE_META_FILENAME));
    expect(location.payloadDir).toBe(join(expectedDirectory, TASK_CACHE_PAYLOAD_DIRECTORY_NAME));
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
