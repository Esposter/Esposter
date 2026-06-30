import { PNPM_LOCKFILE_FILENAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";

const DEFAULT_LOCKFILE_CONTENT = "lockfileVersion: '9.0'\n";
// Realpath-resolved so path comparisons survive a symlinked tmpdir (macOS `/var`→`/private/var`, Windows short
// Names). Private so every test temp dir is minted through it and therefore tracked for cleanup.
const createTemporaryDirectory = (): string => realpathSync(mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX)));
// Hands a suite temp dirs and remembers them so one `cleanup()` removes them all. `createWorkspace()` seeds a pnpm
// Lockfile so the dir resolves as a workspace root; `track()` registers an externally-built dir for the same cleanup.
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
