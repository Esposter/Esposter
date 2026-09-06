import { SourceMirrorEntryType } from "#src/models/exec/wsl/SourceMirrorEntryType";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { SOURCE_MIRROR_TIMEOUT_SECONDS } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { toRootAnchoredExclude } from "#src/services/exec/util/toRootAnchoredExclude";
import { buildSourceMirrorManifest } from "#src/services/exec/wsl/buildSourceMirrorManifest";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME,
  VIRRUN_SOURCES_DIRECTORY_NAME,
} from "#src/services/exec/wsl/constants";
import { TEST_WSL_PREFIX } from "#src/services/exec/wsl/constants.test";
import { createWslSourceMirrorSync } from "#src/services/exec/wsl/createWslSourceMirrorSync";
import { getSourceMirrorKey } from "#src/services/exec/wsl/getSourceMirrorKey";
import { getWslSourceMirrorPath } from "#src/services/exec/wsl/getWslSourceMirrorPath";
import { resolveMirrorExcludes } from "#src/services/exec/wsl/resolveMirrorExcludes";
import { jsonDateParse } from "@esposter/shared";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({ cacheRoot: "", unarchivedPaths: [] as string[] }));
// The "UNC" cache root is just a real temp dir here, so the planner's host-side staging/reads — including the real
// Host `tar` spawn building the archive — exercise real fs; the same TEST_WSL_PREFIX transform the sibling wsl tests
// Use derives the Linux-side paths embedded in the script.
vi.mock(import("#src/services/exec/wsl/getWslNativeCacheRoot"), () => ({
  getWslNativeCacheRoot: () => state.cacheRoot,
}));
// Delegate to the real archive staging but let a test inject unarchived paths — a genuinely Windows-locked file can't
// Be created portably from Node, whose open flags don't control the share mode.
vi.mock(import("#src/services/exec/wsl/createSourceMirrorArchive"), async (importOriginal) => {
  const { createSourceMirrorArchive } = await importOriginal();
  return {
    createSourceMirrorArchive: (...args: Parameters<typeof createSourceMirrorArchive>) => ({
      ...createSourceMirrorArchive(...args),
      unarchivedPaths: state.unarchivedPaths,
    }),
  };
});

vi.mock(import("#src/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

describe(createWslSourceMirrorSync, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cwd = "";
  let entryUnc = "";
  // The set the run resolved (createWslOsBackend); the planner never derives one of its own.
  let excludes: readonly string[] = [];
  const readStaged = (prefix: string): string => {
    const name = readdirSync(entryUnc).find((entry) => entry.startsWith(prefix));
    return name === undefined ? "" : readFileSync(join(entryUnc, name), "utf8");
  };
  // Simulate a prior successful sync: the tree dir exists and the published manifest matches the given tree state,
  // Recorded under the exclude set in force unless a case is exercising an exclude change.
  const publish = (publishedExcludes: readonly string[] = excludes): void => {
    mkdirSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME), { recursive: true });
    writeFileSync(
      join(entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME),
      JSON.stringify({
        entries: buildSourceMirrorManifest(cwd, publishedExcludes),
        excludes: publishedExcludes,
      }),
    );
  };

  // A prior sync whose manifest also claims a path the working tree no longer holds — the delete side of a delta.
  const publishRemoved = (removedFilename: string): void => {
    mkdirSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME), { recursive: true });
    writeFileSync(
      join(entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME),
      JSON.stringify({
        entries: {
          ...buildSourceMirrorManifest(cwd, excludes),
          [removedFilename]: { mtimeMs: 0, size: 0, target: "", type: SourceMirrorEntryType.File },
        },
        excludes,
      }),
    );
  };

  beforeEach(() => {
    cwd = create();
    state.cacheRoot = create();
    state.unarchivedPaths = [];
    entryUnc = join(state.cacheRoot, VIRRUN_SOURCES_DIRECTORY_NAME, getSourceMirrorKey(cwd));
    excludes = resolveMirrorExcludes(cwd, []);
    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
  });

  afterEach(cleanup);

  test("first run materializes from scratch: full archive extract into a cleared tree", () => {
    expect.hasAssertions();

    const { lockPath, mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(mirrorPath).toBe(getWslSourceMirrorPath(cwd));
    expect(lockPath).toBe(`${mirrorPath}.lock`);
    expect(script).toContain(`mkdir -p '${mirrorPath}'`);
    expect(script).toContain(`flock -w ${SOURCE_MIRROR_TIMEOUT_SECONDS} 9`);
    // Clearing the tree before the extract is the drift self-heal — the archive carries the complete mirrored set.
    expect(script).toContain(`rm -rf '${mirrorPath}' && mkdir -p '${mirrorPath}'`);
    // `--warning=no-unknown-keyword` silences GNU tar's benign LIBARCHIVE.symlinktype header noise from bsdtar-authored
    // Symlink members — see createWslSourceMirrorSync's extract comment.
    expect(script).toContain(`timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} tar --warning=no-unknown-keyword -xf`);
    // Bsdtar records NTFS entries as 644/755 — the chmod restores the drvfs-parity 777 the sandbox lower always had.
    expect(script).toContain(`chmod -R 777 '${mirrorPath}'`);
    expect(script).toContain(`9> '${mirrorPath}.lock'`);
    expect(script).toContain(`/${VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME}'`);
    // The archive is staged pid-tagged beside the manifest/origin temps and carries the mirrored file itself; its
    // Null-delimited copy-list input is consumed and unlinked during planning, before the script ever runs.
    expect(readStaged(`${VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX}${process.pid}.`)).toContain(TEST_FILENAME);
    expect(readStaged(VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX)).toBe("");
    // The next manifest is staged host-side as a pid-tagged temp the script publishes via atomic mv, carrying the
    // Exclude set it was walked under so a later run can tell a stale mirrored set from a current one.
    expect(jsonDateParse(readStaged(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${process.pid}.`))).toStrictEqual({
      entries: { [TEST_FILENAME]: expect.anything() },
      excludes,
    });
  });

  // Publishing the marker up front is what makes an entry reapable at all: a sync that dies before the script runs
  // Would otherwise leave a dir no reaper may ever attribute, and those corpses accumulate forever
  test("publishes the origin marker as soon as the entry exists, before the script has run", () => {
    expect.hasAssertions();

    createWslSourceMirrorSync(cwd, excludes);

    expect(readFileSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME), "utf8")).toBe(cwd);
    // Staged then renamed, never written in place: a reaper reading a torn path would judge the repo deleted and
    // Reap this live mirror.
    expect(readStaged(VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX)).toBe("");
  });

  test("returns an empty script when the published manifest matches the working tree", () => {
    expect.hasAssertions();

    publish();

    const { lockPath, mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(script).toBe("");
    // The skip path still returns the lock path — the run holds a shared flock on it while bwrap reads the mirror.
    expect(lockPath).toBe(`${mirrorPath}.lock`);
    // Nothing is staged on the skip path — the run pays no sync at all.
    expect(readStaged(VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX)).toBe("");
  });

  test("stages the delta archive and delete list and applies only the delta", () => {
    expect.hasAssertions();

    const removedFilename = "b";
    publishRemoved(removedFilename);
    writeFileSync(join(cwd, TEST_FILENAME), `${TEST_FILENAME}${TEST_FILENAME}`);

    const { mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(script).toContain(`xargs -0r rm -rf --`);
    expect(script).toContain(`timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} tar --warning=no-unknown-keyword -xf`);
    expect(script).toContain(`chmod -R 777 '${mirrorPath}'`);
    // A delta never clears the tree — that is the full materialize's move.
    expect(script).not.toContain(`rm -rf '${mirrorPath}'`);
    expect(readStaged(VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX)).toContain(TEST_FILENAME);
    expect(readStaged(VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX)).toBe(`${removedFilename}\0`);
  });

  test("skips the archive and extract when the delta only deletes", () => {
    expect.hasAssertions();

    const removedFilename = "b";
    publishRemoved(removedFilename);

    const { script } = createWslSourceMirrorSync(cwd, excludes);

    expect(script).toContain(`xargs -0r rm -rf --`);
    expect(script).not.toContain("tar --warning=no-unknown-keyword -xf");
    expect(readStaged(VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX)).toBe("");
    expect(readStaged(VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX)).toBe(`${removedFilename}\0`);
  });

  test("prunes an unarchived copy path from the published manifest so later runs retry it", () => {
    expect.hasAssertions();

    state.unarchivedPaths = [TEST_FILENAME];

    const { script } = createWslSourceMirrorSync(cwd, excludes);

    // The run still proceeds — a locked or vanished file is skipped, not fatal — but the manifest must not claim it.
    expect(script).not.toBe("");
    expect(jsonDateParse(readStaged(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${process.pid}.`))).toStrictEqual({
      entries: {},
      excludes,
    });
  });

  // The planner walks and publishes the caller's set, never one it re-derives: only the caller knows the run's
  // `environment`, and a re-read of `virrun.config` cannot see one passed programmatically. A set derived here would
  // Keep a prepare output the write-back mask drops (or drop one it keeps), and the two directions the mirror
  // Promises are one rule would describe different trees.
  test("walks and publishes the exclude set it is handed", () => {
    expect.hasAssertions();

    const outputDirectory = "c";
    const callerExcludes = [...excludes, toRootAnchoredExclude(outputDirectory)];
    mkdirSync(join(cwd, outputDirectory), { recursive: true });
    writeFileSync(join(cwd, outputDirectory, TEST_FILENAME), TEST_FILENAME);

    createWslSourceMirrorSync(cwd, callerExcludes);

    expect(jsonDateParse(readStaged(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${process.pid}.`))).toStrictEqual({
      entries: { [TEST_FILENAME]: expect.anything() },
      excludes: callerExcludes,
    });
  });

  test("falls back to the full materialize when the manifest is unreadable", () => {
    expect.hasAssertions();

    publish();
    writeFileSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME), "{");

    const { mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(script).toContain(`rm -rf '${mirrorPath}'`);
  });

  // The bug this closes: a path on either side of an exclude change is in NEITHER manifest — the old one excluded it,
  // The new walk doesn't produce it — so an entries-only diff emits no delete and the mirror keeps its copy forever.
  // The sandbox goes on reading that ghost tree, and any tool that rewrites one of its files copies it up into the
  // Upper the write-back flushes, recreating on the host a directory the user deleted. Linked worktrees make this the
  // Normal case rather than a one-off, since they come and go while a repo is worked on.
  test("deletes a path the published exclude set disagrees with, without rebuilding the whole mirror", () => {
    expect.hasAssertions();

    const worktreePath = "b/c";
    publish([...excludes, worktreePath]);

    const { mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(readStaged(VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX)).toBe(`${worktreePath}\0`);
    // A targeted delete, not the clearing materialize — worktree churn must not cost a full re-copy of the tree.
    expect(script).not.toContain(`rm -rf '${mirrorPath}' &&`);
    // Published under the set in force now, so the reconciliation is paid once rather than on every later run.
    expect(jsonDateParse(readStaged(`${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${process.pid}.`))).toStrictEqual({
      entries: buildSourceMirrorManifest(cwd, excludes),
      excludes,
    });
  });

  test("keeps the skip path when the exclude set is merely ordered differently", () => {
    expect.hasAssertions();

    publish(excludes.toReversed());

    expect(createWslSourceMirrorSync(cwd, excludes).script).toBe("");
  });

  // A bare name matches its segment at any depth, so no delete list can target it — only clearing the tree can.
  test("falls back to the full materialize when a bare-name exclude changed", () => {
    expect.hasAssertions();

    publish([...excludes, "dist"]);

    const { mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(script).toContain(`rm -rf '${mirrorPath}' && mkdir -p '${mirrorPath}'`);
  });

  test("distrusts a manifest whose mirror tree is gone and forces the full materialize", () => {
    expect.hasAssertions();

    publish();
    rmSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME), { force: true, recursive: true });

    const { mirrorPath, script } = createWslSourceMirrorSync(cwd, excludes);

    expect(script).toContain(`rm -rf '${mirrorPath}'`);
  });
});
