import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { createWorkspaceDir } from "@/services/exec/test/createWorkspaceDir.test";
import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { rmSync } from "node:fs";
import { afterEach, describe, expect, test } from "vitest";

const lockfileContent = "lockfileVersion: '9.0'\n";
const temporaryDirectories: string[] = [];
// A lockfile-less dir exercises the throw path; any other content makes a workspace root. Both delegate to the
// Shared fixtures and are tracked here for cleanup.
const createRepo = (content?: string): string => {
  const dir = content === undefined ? createTemporaryDirectory() : createWorkspaceDir(content);
  temporaryDirectories.push(dir);
  return dir;
};

describe(computeLockfileHash, () => {
  afterEach(() => {
    while (temporaryDirectories.length > 0) {
      const dir = temporaryDirectories.pop();
      if (dir !== undefined) rmSync(dir, { force: true, recursive: true });
    }
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

  test("throws when the repo has no lockfile to snapshot", () => {
    expect.hasAssertions();

    expect(() => computeLockfileHash(createRepo())).toThrow(PNPM_LOCKFILE_FILENAME);
  });
});
