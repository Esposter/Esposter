import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { rmSync } from "node:fs";
import { describe } from "vitest";
// Hands a suite throwaway dirs and remembers them so a single cleanup() in afterEach removes them all, instead
// Of every snapshot/config test re-implementing the same track-then-teardown loop. `create()` allocates a fresh
// Temp dir; `track()` registers an externally-built dir (e.g. a seeded workspace) for the same cleanup. A
// `.test.ts` so ctix keeps it out of the public barrel.
export const createTemporaryDirectoryTracker = (): {
  cleanup: () => void;
  create: () => string;
  track: (directory: string) => string;
} => {
  const directories: string[] = [];
  const track = (directory: string): string => {
    directories.push(directory);
    return directory;
  };
  return {
    cleanup: () => {
      for (const directory of directories.splice(0)) rmSync(directory, { force: true, recursive: true });
    },
    create: () => track(createTemporaryDirectory()),
    track,
  };
};

describe.todo("createTemporaryDirectoryTracker");
