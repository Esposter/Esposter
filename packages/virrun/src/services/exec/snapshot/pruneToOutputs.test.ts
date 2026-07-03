import { pruneToOutputs } from "@/services/exec/snapshot/pruneToOutputs";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { NODE_MODULES_DIRECTORY, PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(pruneToOutputs, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // A two-segment output dir (`a/a`) so the walk must descend an ancestor (`a`) to reach it.
  const output = `${TEST_FILENAME}/${TEST_FILENAME}`;

  afterEach(() => {
    cleanup();
  });

  test("keeps the declared output subtree and drops the dep-tree churn beside it", () => {
    expect.hasAssertions();

    const upperDir = create();
    mkdirSync(join(upperDir, TEST_FILENAME, TEST_FILENAME), { recursive: true });
    writeFileSync(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME), "");
    // A lockfile the prepare command rewrote beside the output's ancestor — not on any output path, so dropped.
    writeFileSync(join(upperDir, TEST_FILENAME, PNPM_LOCKFILE_FILENAME), "");
    mkdirSync(join(upperDir, NODE_MODULES_DIRECTORY), { recursive: true });
    writeFileSync(join(upperDir, NODE_MODULES_DIRECTORY, TEST_FILENAME), "");

    pruneToOutputs(upperDir, [output]);

    expect(existsSync(join(upperDir, TEST_FILENAME, TEST_FILENAME, TEST_FILENAME))).toBe(true);
    expect(existsSync(join(upperDir, TEST_FILENAME, PNPM_LOCKFILE_FILENAME))).toBe(false);
    expect(existsSync(join(upperDir, NODE_MODULES_DIRECTORY))).toBe(false);
  });

  test("drops an ancestor's sibling directory that leads to no output", () => {
    expect.hasAssertions();

    const upperDir = create();
    // `a/aa` shares the ancestor `a` with the output `a/a` but is not on its path, so it is dropped whole.
    const sibling = `${TEST_FILENAME}${TEST_FILENAME}`;
    mkdirSync(join(upperDir, TEST_FILENAME, sibling), { recursive: true });
    writeFileSync(join(upperDir, TEST_FILENAME, sibling, TEST_FILENAME), "");

    pruneToOutputs(upperDir, [output]);

    expect(existsSync(join(upperDir, TEST_FILENAME, sibling))).toBe(false);
    // The ancestor `a` itself survives as the path to the output.
    expect(existsSync(join(upperDir, TEST_FILENAME))).toBe(true);
  });
});
