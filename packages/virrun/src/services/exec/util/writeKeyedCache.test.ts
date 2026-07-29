import { createKeyedCacheSchema } from "@/models/exec/KeyedCache";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { writeKeyedCache } from "@/services/exec/util/writeKeyedCache";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

describe(writeKeyedCache, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const key = "";
  const value = "";

  afterEach(cleanup);

  test("persists the cache as validatable JSON", () => {
    expect.hasAssertions();

    const file = join(create(), TEST_FILENAME);
    writeKeyedCache(file, { key, value });

    const { storedAtMs, ...cache } = createKeyedCacheSchema(z.string()).parse(JSON.parse(readFileSync(file, "utf8")));

    expect(cache).toStrictEqual({ key, value });
    expect(storedAtMs).toBeTypeOf("number");
  });

  test("stamps the capture time so a reader can bound the value's age", () => {
    expect.hasAssertions();

    const file = join(create(), TEST_FILENAME);
    const before = Date.now();
    writeKeyedCache(file, { key, value });
    const { storedAtMs } = createKeyedCacheSchema(z.string()).parse(JSON.parse(readFileSync(file, "utf8")));

    expect(storedAtMs).toBeGreaterThanOrEqual(before);
    expect(storedAtMs).toBeLessThanOrEqual(Date.now());
  });

  test("creates the parent directory when it does not yet exist", () => {
    expect.hasAssertions();

    const file = join(create(), TEST_FILENAME, TEST_FILENAME);
    writeKeyedCache(file, { key, value });

    const { storedAtMs, ...cache } = createKeyedCacheSchema(z.string()).parse(JSON.parse(readFileSync(file, "utf8")));

    expect(cache).toStrictEqual({ key, value });
    expect(storedAtMs).toBeTypeOf("number");
  });
});
