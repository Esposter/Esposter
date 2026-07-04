import type { SourceMirrorManifestEntry } from "@/models/exec/wsl/SourceMirrorManifestEntry";

import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { diffSourceMirrorManifests } from "@/services/exec/wsl/diffSourceMirrorManifests";
import { describe, expect, test } from "vitest";

const OTHER_FILENAME = "b";
const file = (mtimeMs = 0, size = 0): SourceMirrorManifestEntry => ({
  mtimeMs,
  size,
  target: "",
  type: SourceMirrorEntryType.File,
});
const directory: SourceMirrorManifestEntry = { mtimeMs: 0, size: 0, target: "", type: SourceMirrorEntryType.Directory };
const symlink = (target: string): SourceMirrorManifestEntry => ({
  mtimeMs: 0,
  size: 0,
  target,
  type: SourceMirrorEntryType.Symlink,
});

describe(diffSourceMirrorManifests, () => {
  test("returns an empty delta for identical manifests", () => {
    expect.hasAssertions();

    const manifest = { [TEST_FILENAME]: file() };

    expect(diffSourceMirrorManifests(manifest, manifest)).toStrictEqual({ copyPaths: [], deletePaths: [] });
  });

  test("copies a new entry and deletes a removed one", () => {
    expect.hasAssertions();

    const delta = diffSourceMirrorManifests({ [TEST_FILENAME]: file() }, { [OTHER_FILENAME]: file() });

    expect(delta).toStrictEqual({ copyPaths: [OTHER_FILENAME], deletePaths: [TEST_FILENAME] });
  });

  test("copies an entry whose mtime, size, or symlink target changed", () => {
    expect.hasAssertions();

    expect(
      diffSourceMirrorManifests({ [TEST_FILENAME]: file(0) }, { [TEST_FILENAME]: file(1) }).copyPaths,
    ).toStrictEqual([TEST_FILENAME]);
    expect(
      diffSourceMirrorManifests({ [TEST_FILENAME]: file(0, 0) }, { [TEST_FILENAME]: file(0, 1) }).copyPaths,
    ).toStrictEqual([TEST_FILENAME]);
    expect(
      diffSourceMirrorManifests(
        { [TEST_FILENAME]: symlink(TEST_FILENAME) },
        { [TEST_FILENAME]: symlink(OTHER_FILENAME) },
      ).copyPaths,
    ).toStrictEqual([TEST_FILENAME]);
  });

  test("does not copy an unchanged directory entry", () => {
    expect.hasAssertions();

    expect(diffSourceMirrorManifests({ [TEST_FILENAME]: directory }, { [TEST_FILENAME]: directory })).toStrictEqual({
      copyPaths: [],
      deletePaths: [],
    });
  });

  test("puts a type flip in both the delete and copy sets so rsync recreates it cleanly", () => {
    expect.hasAssertions();

    const delta = diffSourceMirrorManifests({ [TEST_FILENAME]: file() }, { [TEST_FILENAME]: directory });

    expect(delta).toStrictEqual({ copyPaths: [TEST_FILENAME], deletePaths: [TEST_FILENAME] });
  });

  test("sorts both lists so a staged sync script is deterministic", () => {
    expect.hasAssertions();

    const delta = diffSourceMirrorManifests(
      { c: file(), [OTHER_FILENAME]: file() },
      { d: file(), [TEST_FILENAME]: file() },
    );

    expect(delta.copyPaths).toStrictEqual([TEST_FILENAME, "d"]);
    expect(delta.deletePaths).toStrictEqual([OTHER_FILENAME, "c"]);
  });
});
