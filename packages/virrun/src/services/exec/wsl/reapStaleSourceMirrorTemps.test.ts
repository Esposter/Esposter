import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import {
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
} from "@/services/exec/wsl/constants";
import { reapStaleSourceMirrorTemps } from "@/services/exec/wsl/reapStaleSourceMirrorTemps";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleSourceMirrorTemps, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let entryUnc = "";
  const seed = (name: string): string => {
    const path = join(entryUnc, name);
    writeFileSync(path, "");
    return path;
  };

  beforeEach(() => {
    entryUnc = create();
  });

  afterEach(cleanup);

  test("reaps a hard-killed run's staged temps while keeping a live run's and the published entries", () => {
    expect.hasAssertions();

    const deadManifest = seed(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const deadOrigin = seed(`${VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const deadCopy = seed(`${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const deadDelete = seed(`${VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX}${DEAD_PID}.${TEST_FILENAME}`);
    const liveManifest = seed(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${process.pid}.${TEST_FILENAME}`);
    const publishedManifest = seed(VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME);
    const publishedOrigin = seed(VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME);

    reapStaleSourceMirrorTemps(entryUnc);

    expect(existsSync(deadManifest)).toBe(false);
    expect(existsSync(deadOrigin)).toBe(false);
    expect(existsSync(deadCopy)).toBe(false);
    expect(existsSync(deadDelete)).toBe(false);
    expect(existsSync(liveManifest)).toBe(true);
    expect(existsSync(publishedManifest)).toBe(true);
    expect(existsSync(publishedOrigin)).toBe(true);
  });

  test("is a no-op on an entry dir that does not exist yet", () => {
    expect.hasAssertions();

    expect(() => {
      reapStaleSourceMirrorTemps(join(entryUnc, TEST_FILENAME));
    }).not.toThrow();
  });
});
