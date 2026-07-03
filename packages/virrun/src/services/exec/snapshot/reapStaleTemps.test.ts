import {
  VIRRUN_SNAPSHOT_TEMP_PREFIXES,
  VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { reapStaleTemps } from "@/services/exec/snapshot/reapStaleTemps";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(reapStaleTemps, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let dir = "";
  const seed = (name: string): string => {
    const entry = join(dir, name);
    mkdirSync(entry, { recursive: true });
    return entry;
  };

  beforeEach(() => {
    dir = create();
  });

  afterEach(cleanup);

  test("reaps every mkdtemp temp sibling while keeping the published layers", () => {
    expect.hasAssertions();

    const captureUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.aBcDeF`);
    const captureWork = seed(`${VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME}.aBcDeF`);
    const persistUpper = seed(`${VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME}.persist.gHiJkL`);
    const publishedUpper = seed(VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME);

    reapStaleTemps(dir, VIRRUN_SNAPSHOT_TEMP_PREFIXES);

    expect(existsSync(captureUpper)).toBe(false);
    expect(existsSync(captureWork)).toBe(false);
    expect(existsSync(persistUpper)).toBe(false);
    expect(existsSync(publishedUpper)).toBe(true);
  });
});
