import { getHomeCacheDirectory } from "#src/services/exec/test/getHomeCacheDirectory";
import { VIRRUN_TEMP_DIR_PREFIX } from "#src/services/exec/util/constants";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import { withPidTempPrefix } from "#src/services/exec/util/withPidTempPrefix";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, test } from "vitest";

// Mints a temp directory under $HOME's cache, never os.tmpdir: the sandbox masks /tmp with --tmpfs, which would hide a
// /tmp fixture from the command running inside — the reason every acceptance corpus, checkout and cache home is staged
// Here. Pid-tagged, because a run killed before its afterAll (or a file whose module-scope setup throws before
// Registering one) strands the directory, and the global setup's reapStaleTemps reclaims it only once it can read a
// Dead owner out of the name.
export const createHomeCacheTemporaryDirectory = (): string => {
  const cache = getHomeCacheDirectory();
  mkdirSync(cache, { recursive: true });
  return mkdtempSync(join(cache, withPidTempPrefix(VIRRUN_TEMP_DIR_PREFIX)));
};

describe(createHomeCacheTemporaryDirectory, () => {
  test("names its owner so the global setup's reap can reclaim it once the run dies", () => {
    expect.hasAssertions();

    const directory = createHomeCacheTemporaryDirectory();
    rmSync(directory, { force: true, recursive: true });

    expect(parseTempOwnerPid(basename(directory), [VIRRUN_TEMP_DIR_PREFIX])).toBe(process.pid);
  });
});
