import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { PNPM_LOCKFILE_FILENAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const lockfileContent = "lockfileVersion: '9.0'\n";
const temporaryDirectories: string[] = [];

const createRepo = (content?: string): string => {
  const dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  temporaryDirectories.push(dir);
  if (content !== undefined) writeFileSync(join(dir, PNPM_LOCKFILE_FILENAME), content);
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
