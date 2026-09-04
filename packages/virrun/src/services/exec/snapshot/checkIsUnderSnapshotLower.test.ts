import { checkIsUnderSnapshotLower } from "#src/services/exec/snapshot/checkIsUnderSnapshotLower";
import { GIT_DIRECTORY, NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

describe(checkIsUnderSnapshotLower, () => {
  const emptyPaths = new Set<string>();
  const noMaskedPaths: readonly string[] = [];

  test("masks a write inside a node_modules tree even when it has no snapshot entry of its own", () => {
    expect.hasAssertions();

    expect(checkIsUnderSnapshotLower(`${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}/${TEST_FILENAME}`, emptyPaths, noMaskedPaths)).toBe(
      true,
    );
  });

  test("masks a snapshot-lower entry itself", () => {
    expect.hasAssertions();

    expect(checkIsUnderSnapshotLower(TEST_FILENAME, new Set([TEST_FILENAME]), noMaskedPaths)).toBe(true);
  });

  test("masks an output dir itself and everything inside it", () => {
    expect.hasAssertions();

    expect(checkIsUnderSnapshotLower(TEST_FILENAME, emptyPaths, [TEST_FILENAME])).toBe(true);
    expect(checkIsUnderSnapshotLower(`${TEST_FILENAME}/${TEST_FILENAME}`, emptyPaths, [TEST_FILENAME])).toBe(true);
  });

  test("does not mask a source file under a shared parent the snapshot lower also materialises", () => {
    expect.hasAssertions();

    // `pnpm install` puts a per-package node_modules under `a/a`, so the snapshot lower carries the shared parents
    // `a` and `a/a` (and the node_modules itself) — but the real source file `a/a/a` beneath them must still flush.
    const snapshotLowerPaths = new Set([
      `${TEST_FILENAME}/${TEST_FILENAME}/${NODE_MODULES_DIRECTORY}`,
      `${TEST_FILENAME}/${TEST_FILENAME}`,
      TEST_FILENAME,
    ]);

    expect(
      checkIsUnderSnapshotLower(`${TEST_FILENAME}/${TEST_FILENAME}/${TEST_FILENAME}`, snapshotLowerPaths, noMaskedPaths),
    ).toBe(false);
  });

  test("does not mask a sibling of an output dir that merely shares its prefix", () => {
    expect.hasAssertions();

    // `a` is an output dir; `aa` shares the prefix but is not under it, so it must still flush.
    expect(checkIsUnderSnapshotLower(`${TEST_FILENAME}${TEST_FILENAME}`, emptyPaths, [TEST_FILENAME])).toBe(false);
  });

  // The write-back half of the source-mirror exclude rule: on win32 the sandbox reads a mirror those paths were
  // Filtered out of, so an upper entry under one is stale mirror content, not a host file the command edited —
  // Flushing it resurrected `.agents/worktrees` trees the host had already deleted.
  test("masks a mirror-excluded path at any depth so a ghost write can never reach the host", () => {
    expect.hasAssertions();

    // A linked worktree root the mirror excluded, and the repo git dir.
    const worktreePath = `${TEST_FILENAME}/worktree`;
    const maskedPaths = [worktreePath, GIT_DIRECTORY];

    expect(checkIsUnderSnapshotLower(`${worktreePath}/${TEST_FILENAME}`, emptyPaths, maskedPaths)).toBe(true);
    expect(checkIsUnderSnapshotLower(`${GIT_DIRECTORY}/${TEST_FILENAME}`, emptyPaths, maskedPaths)).toBe(true);
    expect(checkIsUnderSnapshotLower(`${TEST_FILENAME}/${GIT_DIRECTORY}/${TEST_FILENAME}`, emptyPaths, maskedPaths)).toBe(
      true,
    );
    // Source that merely shares a masked path's prefix is a normal flush — the mask is segment-anchored.
    expect(checkIsUnderSnapshotLower(`${GIT_DIRECTORY}ignore`, emptyPaths, maskedPaths)).toBe(false);
  });

  test("does not mask a produced file outside the dependency closure", () => {
    expect.hasAssertions();

    expect(checkIsUnderSnapshotLower(TEST_FILENAME, emptyPaths, noMaskedPaths)).toBe(false);
  });
});
