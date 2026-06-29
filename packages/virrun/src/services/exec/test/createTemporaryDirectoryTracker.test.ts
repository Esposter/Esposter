import { PNPM_LOCKFILE_FILENAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";

const DEFAULT_LOCKFILE_CONTENT = "lockfileVersion: '9.0'\n";
// A fresh throwaway dir under the OS temp root, realpath-resolved so path comparisons survive a symlinked tmpdir
// (macOS `/var`→`/private/var`, Windows short names). Private to the tracker so every test temp dir is minted
// Through it and therefore tracked for cleanup — there is no untracked minter to leak from.
const createTemporaryDirectory = (): string => realpathSync(mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX)));
// The single source of throwaway directories for tests: hands a suite temp dirs and remembers them so one
// `cleanup()` in afterEach removes them all, instead of every test re-implementing track-then-teardown. `create()`
// Mints a plain temp dir; `createWorkspace()` mints one seeded with a pnpm lockfile so it resolves as a workspace
// Root (the anchor for virrun's repo cache, snapshot key, and .gitignore); `track()` registers an
// Externally-built dir (e.g. a `createWorkspaceCorpus` mirror under $HOME) for the same cleanup. A `.test.ts` so
// Ctix keeps it out of the public barrel.
export const createTemporaryDirectoryTracker = (): {
  cleanup: () => void;
  create: () => string;
  createWorkspace: (lockfileContent?: string) => string;
  track: (directory: string) => string;
} => {
  const directories: string[] = [];
  const track = (directory: string): string => {
    directories.push(directory);
    return directory;
  };
  const create = (): string => track(createTemporaryDirectory());
  const createWorkspace = (lockfileContent = DEFAULT_LOCKFILE_CONTENT): string => {
    const directory = create();
    writeFileSync(join(directory, PNPM_LOCKFILE_FILENAME), lockfileContent);
    return directory;
  };
  return {
    cleanup: () => {
      for (const directory of directories.splice(0)) rmSync(directory, { force: true, recursive: true });
    },
    create,
    createWorkspace,
    track,
  };
};

describe.todo("createTemporaryDirectoryTracker");
