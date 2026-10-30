import { GENERATED_PATH, OUTSIDE_PATH, UNFORMATTED_SOURCE } from "#src/services/format/constants.test";
import { OXFMT_CONFIGURATION_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe } from "vitest";

// A temporary checkout holding the two files, each unformatted.
// Its configuration is a copy of the repository's, so the patterns the test runs under are the repository's own.
// `node_modules` links to the repository's install, so the copy resolves `oxfmt` as the repository does.
// The path is the physical one: the formatter matches its ignore patterns against the path it resolves.
// Through a symlinked temporary folder, that resolved path is not the one the patterns name.
// Returns a getter for the checkout, since each test gets its own
export const setupFormatterTree = (): (() => string) => {
  let root: string;

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), "formatter-tree-")));
    copyFileSync(join(REPOSITORY_ROOT, OXFMT_CONFIGURATION_FILE), join(root, OXFMT_CONFIGURATION_FILE));
    symlinkSync(join(REPOSITORY_ROOT, "node_modules"), join(root, "node_modules"), "junction");
    for (const path of [GENERATED_PATH, OUTSIDE_PATH]) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), UNFORMATTED_SOURCE);
    }
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  return () => root;
};

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("setupFormatterTree");
