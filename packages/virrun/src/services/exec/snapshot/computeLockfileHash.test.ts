import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const lockfileContent = "lockfileVersion: '9.0'\n";

describe(computeLockfileHash, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  // A lockfile-less dir exercises the throw path; any other content makes a workspace root.
  const createRepository = (content?: string): string => (content === undefined ? create() : createWorkspace(content));

  afterEach(() => {
    cleanup();
  });

  test("hashes the lockfile content to a sha256 hex digest", () => {
    expect.hasAssertions();

    expect(computeLockfileHash(createRepository(lockfileContent))).toMatch(/^[0-9a-f]{64}$/u);
  });

  test("yields the same hash for identical lockfiles and a different one when content changes", () => {
    expect.hasAssertions();

    expect(computeLockfileHash(createRepository(lockfileContent))).toBe(
      computeLockfileHash(createRepository(lockfileContent)),
    );
    expect(computeLockfileHash(createRepository(lockfileContent))).not.toBe(
      computeLockfileHash(createRepository(`${lockfileContent}  added: true\n`)),
    );
  });

  test("hashes the workspace-root lockfile when invoked from a nested subdirectory", () => {
    expect.hasAssertions();

    const repository = createRepository(lockfileContent);
    const nestedDirectory = join(repository, TEST_FILENAME, TEST_FILENAME);
    mkdirSync(nestedDirectory, { recursive: true });

    expect(computeLockfileHash(nestedDirectory)).toBe(computeLockfileHash(repository));
  });

  test("re-reads the same lockfile path when its content changes (memoization stays honest)", () => {
    expect.hasAssertions();

    const repository = createRepository(lockfileContent);
    const lockfile = join(repository, PNPM_LOCKFILE_FILENAME);
    const beforeHash = computeLockfileHash(repository);
    // An in-process rewrite (an install regenerating the lockfile) must invalidate the cached digest; the size
    // Change alone defeats the stat guard even where the mtime resolution can't see a fast back-to-back write.
    writeFileSync(lockfile, `${lockfileContent}  added: true\n`);

    expect(computeLockfileHash(repository)).not.toBe(beforeHash);
  });

  test("throws when the repo has no lockfile to snapshot", () => {
    expect.hasAssertions();

    const repository = createRepository();

    expect(() => computeLockfileHash(repository)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${
        new InvalidOperationError(
          Operation.Read,
          resolveWorkspaceRoot.name,
          `no ${PNPM_LOCKFILE_FILENAME} found in ${repository} or any parent`,
        ).message
      }]`,
    );
  });
});
