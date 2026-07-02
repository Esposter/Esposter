import { isUnderSnapshotLower } from "@/services/exec/snapshot/isUnderSnapshotLower";
import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

describe(isUnderSnapshotLower, () => {
  const empty = new Set<string>();
  const noOutputs: readonly string[] = [];

  test("masks a write inside a node_modules tree even when it has no snapshot entry of its own", () => {
    expect.hasAssertions();

    expect(isUnderSnapshotLower(`${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}/${TEST_FILENAME}`, empty, noOutputs)).toBe(
      true,
    );
  });

  test("masks a snapshot-lower entry itself", () => {
    expect.hasAssertions();

    expect(isUnderSnapshotLower(TEST_FILENAME, new Set([TEST_FILENAME]), noOutputs)).toBe(true);
  });

  test("masks an output dir itself and everything inside it", () => {
    expect.hasAssertions();

    expect(isUnderSnapshotLower(TEST_FILENAME, empty, [TEST_FILENAME])).toBe(true);
    expect(isUnderSnapshotLower(`${TEST_FILENAME}/${TEST_FILENAME}`, empty, [TEST_FILENAME])).toBe(true);
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
      isUnderSnapshotLower(`${TEST_FILENAME}/${TEST_FILENAME}/${TEST_FILENAME}`, snapshotLowerPaths, noOutputs),
    ).toBe(false);
  });

  test("does not mask a sibling of an output dir that merely shares its prefix", () => {
    expect.hasAssertions();

    // `a` is an output dir; `aa` shares the prefix but is not under it, so it must still flush.
    expect(isUnderSnapshotLower(`${TEST_FILENAME}${TEST_FILENAME}`, empty, [TEST_FILENAME])).toBe(false);
  });

  test("does not mask a produced file outside the dependency closure", () => {
    expect.hasAssertions();

    expect(isUnderSnapshotLower(TEST_FILENAME, empty, noOutputs)).toBe(false);
  });
});
