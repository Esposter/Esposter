import {
  VIRRUN_PREPARE_DIRECTORY_NAME,
  VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME,
} from "@/services/exec/snapshot/constants";
import { pruneStalePrepareLayers } from "@/services/exec/snapshot/pruneStalePrepareLayers";
import { DEAD_PID } from "@/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { writeLeaseFile } from "@/services/exec/test/writeLeaseFile.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

// Canonical source-key-shaped dir names: the layer the current source state resolves to, and a superseded one beside it.
const CURRENT_KEY = "0";
const STALE_KEY = "1";

describe(pruneStalePrepareLayers, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cacheHome = "";
  const prepareDir = (): string => join(cacheHome, VIRRUN_PREPARE_DIRECTORY_NAME);
  const seedLayer = (key: string): string => {
    const dir = join(prepareDir(), key);
    mkdirSync(dir, { recursive: true });
    return dir;
  };
  const seedLease = (key: string, pid: number): string =>
    writeLeaseFile(join(seedLayer(key), VIRRUN_SNAPSHOT_LEASES_DIRECTORY_NAME), pid);

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  test("removes every superseded prepare layer while keeping the current one", () => {
    expect.hasAssertions();

    const current = seedLayer(CURRENT_KEY);
    const stale = seedLayer(STALE_KEY);

    pruneStalePrepareLayers(CURRENT_KEY);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(false);
  });

  test("is a no-op when the prepare directory does not exist yet", () => {
    expect.hasAssertions();

    pruneStalePrepareLayers(CURRENT_KEY);

    expect(existsSync(prepareDir())).toBe(false);
  });

  test("keeps a superseded layer a live run still leases", () => {
    expect.hasAssertions();

    const current = seedLayer(CURRENT_KEY);
    const stale = seedLayer(STALE_KEY);
    seedLease(STALE_KEY, process.pid);

    pruneStalePrepareLayers(CURRENT_KEY);

    expect(existsSync(current)).toBe(true);
    expect(existsSync(stale)).toBe(true);
  });

  test("removes a superseded layer whose leases are all dead", () => {
    expect.hasAssertions();

    const stale = seedLayer(STALE_KEY);
    seedLease(STALE_KEY, DEAD_PID);

    pruneStalePrepareLayers(CURRENT_KEY);

    expect(existsSync(stale)).toBe(false);
  });
});
