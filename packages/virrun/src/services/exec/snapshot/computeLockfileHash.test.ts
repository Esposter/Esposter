import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const lockfileContent = "lockfileVersion: '9.0'\n";

describe(computeLockfileHash, () => {
  const { cleanup, create, createWorkspace } = createTemporaryDirectoryTracker();
  // A lockfile-less dir exercises the throw path; any other content makes a workspace root.
  const createRepo = (content?: string): string => (content === undefined ? create() : createWorkspace(content));

  afterEach(() => {
    cleanup();
  });

  test("hashes the lockfile content to a sha256 hex digest", () => {
    expect.hasAssertions();

    expect(computeLockfileHash(createRepo(lockfileContent))).toMatch(/^[0-9a-f]{64}$/u);
  });

  test("yields the same hash for identical lockfiles and a different one when content changes", () => {
    expect.hasAssertions();

    expect(computeLockfileHash(createRepo(lockfileContent))).toBe(computeLockfileHash(createRepo(lockfileContent)));
    expect(computeLockfileHash(createRepo(lockfileContent))).not.toBe(
      computeLockfileHash(createRepo(`${lockfileContent}  added: true\n`)),
    );
  });

  test("hashes the workspace-root lockfile when invoked from a nested subdirectory", () => {
    expect.hasAssertions();

    const repo = createRepo(lockfileContent);
    const nested = join(repo, "packages", "foo");
    mkdirSync(nested, { recursive: true });

    expect(computeLockfileHash(nested)).toBe(computeLockfileHash(repo));
  });

  test("throws when the repo has no lockfile to snapshot", () => {
    expect.hasAssertions();

    expect(() => computeLockfileHash(createRepo())).toThrow(PNPM_LOCKFILE_FILENAME);
  });
});
