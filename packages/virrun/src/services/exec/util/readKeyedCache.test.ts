import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { readKeyedCache } from "#src/services/exec/util/readKeyedCache";
import { writeKeyedCache } from "#src/services/exec/util/writeKeyedCache";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";

describe(readKeyedCache, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const key = "";
  const value = "";
  const valueSchema = z.string();
  let file = "";

  beforeEach(() => {
    file = join(create(), TEST_FILENAME);
  });

  afterEach(cleanup);

  test("returns undefined when no cache file exists yet", () => {
    expect.hasAssertions();

    expect(readKeyedCache(file, valueSchema, key)).toBeUndefined();
  });

  test("returns the persisted value when the key matches", () => {
    expect.hasAssertions();

    writeKeyedCache(file, { key, value });

    expect(readKeyedCache(file, valueSchema, key)).toBe(value);
  });

  test("returns undefined when the host key has changed", () => {
    expect.hasAssertions();

    writeKeyedCache(file, { key, value });

    expect(readKeyedCache(file, valueSchema, " ")).toBeUndefined();
  });

  test("returns undefined when the persisted value fails validation (an older shape)", () => {
    expect.hasAssertions();

    writeKeyedCache(file, { key, value: false });

    expect(readKeyedCache(file, valueSchema, key)).toBeUndefined();
  });

  test("returns the persisted value when it is within the caller's age bound", () => {
    expect.hasAssertions();

    writeKeyedCache(file, { key, value });

    expect(readKeyedCache(file, valueSchema, key, Temporal.Duration.from({ hours: 1 }).total("milliseconds"))).toBe(
      value,
    );
  });

  test("returns undefined when the value is older than the age bound — the drift the key cannot see", () => {
    expect.hasAssertions();

    // Stamped by hand rather than by writeKeyedCache: the point is a capture taken long enough ago that the host's
    // Toolchain could have moved underneath a key that only fingerprints platform + kernel release.
    writeFileSync(
      file,
      JSON.stringify({
        key,
        storedAtMs: Date.now() - Temporal.Duration.from({ hours: 2 }).total("milliseconds"),
        value,
      }),
    );

    expect(
      readKeyedCache(file, valueSchema, key, Temporal.Duration.from({ hours: 1 }).total("milliseconds")),
    ).toBeUndefined();
  });

  test("ignores the value's age when the caller sets no bound", () => {
    expect.hasAssertions();

    writeFileSync(file, JSON.stringify({ key, storedAtMs: 0, value }));

    expect(readKeyedCache(file, valueSchema, key)).toBe(value);
  });

  test("returns undefined on a corrupt cache file rather than throwing", () => {
    expect.hasAssertions();

    writeFileSync(file, "{ not json");

    expect(readKeyedCache(file, valueSchema, key)).toBeUndefined();
  });
});
