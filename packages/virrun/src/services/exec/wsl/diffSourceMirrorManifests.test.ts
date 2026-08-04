import type { SourceMirrorManifest } from "@/models/exec/wsl/SourceMirrorManifest";
import type { SourceMirrorManifestEntry } from "@/models/exec/wsl/SourceMirrorManifestEntry";
import type { SourceMirrorPublication } from "@/models/exec/wsl/SourceMirrorPublication";

import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { toRootAnchoredExclude } from "@/services/exec/util/toRootAnchoredExclude";
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
// A published mirror state: entries plus the exclude set they were walked under, which most cases don't vary.
const publish = (entries: SourceMirrorManifest, excludes: readonly string[] = []): SourceMirrorPublication => ({
  entries,
  excludes,
});
const symlink = (target: string): SourceMirrorManifestEntry => ({
  mtimeMs: 0,
  size: 0,
  target,
  type: SourceMirrorEntryType.Symlink,
});

describe(diffSourceMirrorManifests, () => {
  test("returns an empty delta for identical manifests", () => {
    expect.hasAssertions();

    const publication = { entries: { [TEST_FILENAME]: file() }, excludes: [] };

    expect(diffSourceMirrorManifests(publication, publication)).toStrictEqual({ copyPaths: [], deletePaths: [] });
  });

  test("copies a new entry and deletes a removed one", () => {
    expect.hasAssertions();

    const delta = diffSourceMirrorManifests(
      publish({ [TEST_FILENAME]: file() }),
      publish({ [OTHER_FILENAME]: file() }),
    );

    expect(delta).toStrictEqual({ copyPaths: [OTHER_FILENAME], deletePaths: [TEST_FILENAME] });
  });

  test("copies an entry whose mtime, size, or symlink target changed", () => {
    expect.hasAssertions();

    expect(
      diffSourceMirrorManifests(publish({ [TEST_FILENAME]: file(0) }), publish({ [TEST_FILENAME]: file(1) })).copyPaths,
    ).toStrictEqual([TEST_FILENAME]);
    expect(
      diffSourceMirrorManifests(publish({ [TEST_FILENAME]: file(0, 0) }), publish({ [TEST_FILENAME]: file(0, 1) }))
        .copyPaths,
    ).toStrictEqual([TEST_FILENAME]);
    expect(
      diffSourceMirrorManifests(
        publish({ [TEST_FILENAME]: symlink(TEST_FILENAME) }),
        publish({ [TEST_FILENAME]: symlink(OTHER_FILENAME) }),
      ).copyPaths,
    ).toStrictEqual([TEST_FILENAME]);
  });

  test("does not copy an unchanged directory entry", () => {
    expect.hasAssertions();

    expect(
      diffSourceMirrorManifests(publish({ [TEST_FILENAME]: directory }), publish({ [TEST_FILENAME]: directory })),
    ).toStrictEqual({
      copyPaths: [],
      deletePaths: [],
    });
  });

  test("puts a type flip in both the delete and copy sets so the extract recreates it cleanly", () => {
    expect.hasAssertions();

    const delta = diffSourceMirrorManifests(
      publish({ [TEST_FILENAME]: file() }),
      publish({ [TEST_FILENAME]: directory }),
    );

    expect(delta).toStrictEqual({ copyPaths: [TEST_FILENAME], deletePaths: [TEST_FILENAME] });
  });

  // A path on either side of an exclude change is in NEITHER manifest, so without this the mirror's copy of it can
  // Never be deleted — it survives every later sync, gets read as source, and rides the write-back back onto the host.
  test("deletes a path the exclude sets disagree on, in both directions", () => {
    expect.hasAssertions();

    const worktreePath = `${OTHER_FILENAME}/${TEST_FILENAME}`;
    const added = diffSourceMirrorManifests(publish({}), publish({}, [worktreePath]));
    const removed = diffSourceMirrorManifests(publish({}, [worktreePath]), publish({}));

    expect(added).toStrictEqual({ copyPaths: [], deletePaths: [worktreePath] });
    expect(removed).toStrictEqual({ copyPaths: [], deletePaths: [worktreePath] });
  });

  test("leaves an unchanged exclude set out of the delete list", () => {
    expect.hasAssertions();

    const worktreePath = `${OTHER_FILENAME}/${TEST_FILENAME}`;

    expect(diffSourceMirrorManifests(publish({}, [worktreePath]), publish({}, [worktreePath]))).toStrictEqual({
      copyPaths: [],
      deletePaths: [],
    });
  });

  // A worktree deregistered but left on disk: the walk lists it again, so it must be dropped AND recopied — the plan
  // Runs every delete before every copy, so the two ops compose instead of racing.
  test("both deletes and copies a path that stopped being excluded while still on the host", () => {
    expect.hasAssertions();

    const worktreePath = `${OTHER_FILENAME}/${TEST_FILENAME}`;
    const delta = diffSourceMirrorManifests(publish({}, [worktreePath]), publish({ [worktreePath]: file() }));

    expect(delta).toStrictEqual({ copyPaths: [worktreePath], deletePaths: [worktreePath] });
  });

  // A root-level worktree is a single-segment path, so only the anchor keeps it out of the bare-name shape — and the
  // Delete list is spent as paths under the mirror tree, so the anchor comes off again here. Without both halves the
  // Registration forces the clearing full materialize instead of one targeted delete.
  test("strips the anchor from a path exclude before adding it to the delete list", () => {
    expect.hasAssertions();

    const anchoredPath = toRootAnchoredExclude(TEST_FILENAME);

    expect(diffSourceMirrorManifests(publish({}), publish({}, [anchoredPath]))).toStrictEqual({
      copyPaths: [],
      deletePaths: [TEST_FILENAME],
    });
  });

  // A bare name matches its segment at any depth, which no path list can express; the planner rebuilds instead.
  test("ignores a bare-name exclude change, which the planner routes to the full materialize", () => {
    expect.hasAssertions();

    expect(diffSourceMirrorManifests(publish({}), publish({}, [TEST_FILENAME]))).toStrictEqual({
      copyPaths: [],
      deletePaths: [],
    });
  });

  test("sorts both lists so a staged sync script is deterministic", () => {
    expect.hasAssertions();

    const delta = diffSourceMirrorManifests(
      publish({ c: file(), [OTHER_FILENAME]: file() }),
      publish({ d: file(), [TEST_FILENAME]: file() }),
    );

    expect(delta.copyPaths).toStrictEqual([TEST_FILENAME, "d"]);
    expect(delta.deletePaths).toStrictEqual([OTHER_FILENAME, "c"]);
  });
});
