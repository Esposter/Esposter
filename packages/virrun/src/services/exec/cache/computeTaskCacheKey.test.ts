import { computeTaskCacheKey } from "@/services/exec/cache/computeTaskCacheKey";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { toRootAnchoredExclude } from "@/services/exec/util/toRootAnchoredExclude";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, test } from "vitest";

const MASKED_PATHS: readonly string[] = [];
const initRepository = (directory: string): void => {
  execFileSync("git", ["init", "-q"], { cwd: directory });
};

describe(computeTaskCacheKey, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  const command = "";

  afterEach(() => {
    cleanup();
  });

  test("is null when there is no git repository to hash the source tree", () => {
    expect.hasAssertions();

    expect(computeTaskCacheKey(command, createWorkspace(), MASKED_PATHS)).toBeNull();
  });

  test("is null when there is no lockfile to key the dependency closure", () => {
    expect.hasAssertions();

    const directory = create();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).toBeNull();
  });

  test("is stable for the same command, lockfile, and source tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).toBe(
      computeTaskCacheKey(command, directory, MASKED_PATHS),
    );
  });

  test("differs for a different command over the same tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).not.toBe(
      computeTaskCacheKey(" ", directory, MASKED_PATHS),
    );
  });

  // A hit replays the RECORDED plan rather than rebuilding one, so the mask is never applied a second time: an entry
  // Recorded under a looser mask — a worktree registered since, or anything predating the mask — would flush exactly
  // The ghost paths the mask exists to stop, on every hit until it ages out.
  test("differs for a different write-back mask over the same tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).not.toBe(
      computeTaskCacheKey(command, directory, [toRootAnchoredExclude(TEST_FILENAME)]),
    );
  });

  // POSIX permits newlines in path names, so a delimiter-joined key hashed the command text and the mask onto the
  // Same bytes: a hit would replay a flush plan recorded under a mask the run never asked for.
  test("keys a newline in the command apart from the same text in the write-back mask", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);
    const maskedPath = toRootAnchoredExclude(TEST_FILENAME);

    expect(computeTaskCacheKey(`${command}\n${maskedPath}`, directory, MASKED_PATHS)).not.toBe(
      computeTaskCacheKey(command, directory, [`${maskedPath}\n`]),
    );
  });

  test("treats a string command and its argv form as distinct keys", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).not.toBe(
      computeTaskCacheKey([command], directory, MASKED_PATHS),
    );
  });
});
