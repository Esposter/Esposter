import { writeCacheFile } from "#src/services/sweeps/staleNames/writeCacheFile";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeCacheFile, () => {
  const TEST_PREFIX = "cache-";
  const NESTED_DIRECTORY = "nested";
  const CACHE_FILENAME = "cache.json";
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), TEST_PREFIX));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("replaces the cache, creating its directory and leaving no temporary file beside it", () => {
    expect.hasAssertions();

    const cachePath = join(root, NESTED_DIRECTORY, CACHE_FILENAME);
    writeCacheFile(cachePath, "first");
    writeCacheFile(cachePath, "second");

    expect(readFileSync(cachePath, "utf8")).toBe("second");
    expect(readdirSync(join(root, NESTED_DIRECTORY))).toStrictEqual([CACHE_FILENAME]);
  });
});
