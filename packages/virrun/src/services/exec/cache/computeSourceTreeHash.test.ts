import { computeSourceTreeHash } from "#src/services/exec/cache/computeSourceTreeHash";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { initRepository } from "#src/services/exec/test/initRepository.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(computeSourceTreeHash, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

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
