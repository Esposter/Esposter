import { computeSourceTreeHash } from "@/services/exec/cache/computeSourceTreeHash";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(computeSourceTreeHash, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const initRepository = (directory: string): void => {
    execFileSync("git", ["init", "-q"], { cwd: directory });
  };

  afterEach(() => {
    cleanup();
  });

  test("is null when the directory is not a git repository", () => {
    expect.hasAssertions();

    expect(computeSourceTreeHash(create())).toBeNull();
  });

  test("is stable for an unchanged tree", () => {
    expect.hasAssertions();

    const directory = create();
    initRepository(directory);
    writeFileSync(join(directory, TEST_FILENAME), "");

    expect(computeSourceTreeHash(directory)).toBe(computeSourceTreeHash(directory));
  });

  test("changes when an untracked file's content changes", () => {
    expect.hasAssertions();

    const directory = create();
    initRepository(directory);
    const file = join(directory, TEST_FILENAME);
    writeFileSync(file, "");
    const before = computeSourceTreeHash(directory);
    writeFileSync(file, " ");

    expect(computeSourceTreeHash(directory)).not.toBe(before);
  });

  test("changes when a staged (indexed) file's content changes", () => {
    expect.hasAssertions();

    const directory = create();
    initRepository(directory);
    const file = join(directory, TEST_FILENAME);
    writeFileSync(file, "");
    execFileSync("git", ["add", TEST_FILENAME], { cwd: directory });
    const before = computeSourceTreeHash(directory);
    writeFileSync(file, " ");
    execFileSync("git", ["add", TEST_FILENAME], { cwd: directory });

    expect(computeSourceTreeHash(directory)).not.toBe(before);
  });
});
