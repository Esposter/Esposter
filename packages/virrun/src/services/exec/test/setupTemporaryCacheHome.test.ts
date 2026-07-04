import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { afterEach, beforeEach, describe } from "vitest";
// Registers the shared cache-home fixture behind every unit suite that touches the persisted cache: each test gets a
// Fresh temp dir as VIRRUN_CACHE_HOME (so a real ~/.virrun never leaks into a case), and the override plus every
// Minted dir is torn down after each test. Returns the tracker's minting helpers and a getter for the active home.
export const setupTemporaryCacheHome = (): {
  create: () => string;
  createWorkspace: (lockfileContent?: string) => string;
  getCacheHome: () => string;
  track: (directory: string) => string;
} => {
  const { cleanup, create, createWorkspace, track } = createTemporaryDirectoryTracker();
  let cacheHome = "";

  beforeEach(() => {
    cacheHome = create();
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterEach(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    cleanup();
  });

  return { create, createWorkspace, getCacheHome: () => cacheHome, track };
};

describe.todo("setupTemporaryCacheHome");
