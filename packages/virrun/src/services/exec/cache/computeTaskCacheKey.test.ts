import { computeTaskCacheKey } from "@/services/exec/cache/computeTaskCacheKey";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, test } from "vitest";

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

    expect(computeTaskCacheKey(command, createWorkspace())).toBeNull();
  });

  test("is null when there is no lockfile to key the dependency closure", () => {
    expect.hasAssertions();

    const directory = create();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory)).toBeNull();
  });

  test("is stable for the same command, lockfile, and source tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory)).toBe(computeTaskCacheKey(command, directory));
  });

  test("differs for a different command over the same tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory)).not.toBe(computeTaskCacheKey(" ", directory));
  });

  test("treats a string command and its argv form as distinct keys", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory)).not.toBe(computeTaskCacheKey([command], directory));
  });
});
