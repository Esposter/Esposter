import { computeTaskCacheKey } from "#src/services/exec/cache/computeTaskCacheKey";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { initRepository } from "#src/services/exec/test/initRepository.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { getSandboxNodeVersion } from "#src/services/exec/util/getSandboxNodeVersion";
import { toRootAnchoredExclude } from "#src/services/exec/util/toRootAnchoredExclude";
import { afterEach, describe, expect, test } from "vitest";

describe(computeTaskCacheKey, () => {
  const MASKED_PATHS: readonly string[] = [];
  // Every key below needs the sandbox node major, which computeEnvironmentKey probes from a WSL login shell on win32 —
  // With none reachable the key is null by design, and comparing null against null asserts nothing at all. The two
  // Null cases above stay: they are what the probe failing looks like. CI is linux, where the probe is process.version
  const IS_SANDBOX_NODE_VERSION_READABLE = Boolean(getSandboxNodeVersion());

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

  test.skipIf(!IS_SANDBOX_NODE_VERSION_READABLE)("is stable for the same command, lockfile, and source tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).toBe(
      computeTaskCacheKey(command, directory, MASKED_PATHS),
    );
  });

  test.skipIf(!IS_SANDBOX_NODE_VERSION_READABLE)("differs for a different command over the same tree", () => {
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
  test.skipIf(!IS_SANDBOX_NODE_VERSION_READABLE)("differs for a different write-back mask over the same tree", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).not.toBe(
      computeTaskCacheKey(command, directory, [toRootAnchoredExclude(TEST_FILENAME)]),
    );
  });

  // POSIX permits newlines in path names, so a delimiter-joined key hashed the command text and the mask onto the
  // Same bytes: a hit would replay a flush plan recorded under a mask the run never asked for.
  test.skipIf(!IS_SANDBOX_NODE_VERSION_READABLE)(
    "keys a newline in the command apart from the same text in the write-back mask",
    () => {
      expect.hasAssertions();

      const directory = createWorkspace();
      initRepository(directory);
      const maskedPath = toRootAnchoredExclude(TEST_FILENAME);

      expect(computeTaskCacheKey(`${command}\n${maskedPath}`, directory, MASKED_PATHS)).not.toBe(
        computeTaskCacheKey(command, directory, [`${maskedPath}\n`]),
      );
    },
  );

  test.skipIf(!IS_SANDBOX_NODE_VERSION_READABLE)("treats a string command and its argv form as distinct keys", () => {
    expect.hasAssertions();

    const directory = createWorkspace();
    initRepository(directory);

    expect(computeTaskCacheKey(command, directory, MASKED_PATHS)).not.toBe(
      computeTaskCacheKey([command], directory, MASKED_PATHS),
    );
  });
});
