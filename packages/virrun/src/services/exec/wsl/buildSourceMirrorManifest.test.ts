import { SourceMirrorEntryType } from "#src/models/exec/wsl/SourceMirrorEntryType";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { isSymlinkSupported } from "#src/services/exec/test/isSymlinkSupported.test";
import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { buildSourceMirrorManifest } from "#src/services/exec/wsl/buildSourceMirrorManifest";
import { lstatSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(buildSourceMirrorManifest, () => {
  const NESTED_DIRECTORY_NAME = "b";

  const { cleanup, create } = createTemporaryDirectoryTracker();
  let cwd = "";

  beforeEach(() => {
    cwd = create();
  });

  afterEach(cleanup);

  test("records files with their quick-check signature and directories by presence", () => {
    expect.hasAssertions();

    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
    mkdirSync(join(cwd, NESTED_DIRECTORY_NAME));
    writeFileSync(join(cwd, NESTED_DIRECTORY_NAME, TEST_FILENAME), "");
    const { mtimeMs, size } = lstatSync(join(cwd, TEST_FILENAME));
    const { mtimeMs: nestedMtimeMs } = lstatSync(join(cwd, NESTED_DIRECTORY_NAME, TEST_FILENAME));

    const manifest = buildSourceMirrorManifest(cwd, []);

    expect(manifest).toStrictEqual({
      [`${NESTED_DIRECTORY_NAME}/${TEST_FILENAME}`]: {
        mtimeMs: nestedMtimeMs,
        size: 0,
        target: "",
        type: SourceMirrorEntryType.File,
      },
      [NESTED_DIRECTORY_NAME]: { mtimeMs: 0, size: 0, target: "", type: SourceMirrorEntryType.Directory },
      [TEST_FILENAME]: { mtimeMs, size, target: "", type: SourceMirrorEntryType.File },
    });
  });

  test("excludes a bare name at any depth and never descends into it", () => {
    expect.hasAssertions();

    mkdirSync(join(cwd, NODE_MODULES_DIRECTORY));
    writeFileSync(join(cwd, NODE_MODULES_DIRECTORY, TEST_FILENAME), "");
    mkdirSync(join(cwd, NESTED_DIRECTORY_NAME, NODE_MODULES_DIRECTORY), { recursive: true });
    writeFileSync(join(cwd, NESTED_DIRECTORY_NAME, NODE_MODULES_DIRECTORY, TEST_FILENAME), "");

    const manifest = buildSourceMirrorManifest(cwd, [NODE_MODULES_DIRECTORY]);

    expect(Object.keys(manifest)).toStrictEqual([NESTED_DIRECTORY_NAME]);
  });

  test("excludes a slashed pattern only at its exact relative path", () => {
    expect.hasAssertions();

    // The excluded `b/a` subtree and a same-named `a` at the root that must stay in scope.
    mkdirSync(join(cwd, NESTED_DIRECTORY_NAME, TEST_FILENAME), { recursive: true });
    mkdirSync(join(cwd, TEST_FILENAME));

    const manifest = buildSourceMirrorManifest(cwd, [`${NESTED_DIRECTORY_NAME}/${TEST_FILENAME}`]);

    expect(Object.keys(manifest).toSorted()).toStrictEqual([TEST_FILENAME, NESTED_DIRECTORY_NAME]);
  });

  test.runIf(isSymlinkSupported)("records a symlink by its target path and the link's own stat", () => {
    expect.hasAssertions();

    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
    symlinkSync(TEST_FILENAME, join(cwd, NESTED_DIRECTORY_NAME));
    // The archive preserves symlinks, so the change signal is the link's own lstat (not the target's) plus its target.
    const { mtimeMs, size } = lstatSync(join(cwd, NESTED_DIRECTORY_NAME));

    const manifest = buildSourceMirrorManifest(cwd, []);

    expect(manifest[NESTED_DIRECTORY_NAME]).toStrictEqual({
      mtimeMs,
      size,
      target: TEST_FILENAME,
      type: SourceMirrorEntryType.Symlink,
    });
  });

  test.runIf(isSymlinkSupported)("records a broken symlink so it mirrors as-is rather than dropping out", () => {
    expect.hasAssertions();

    symlinkSync(TEST_FILENAME, join(cwd, NESTED_DIRECTORY_NAME));
    const { mtimeMs, size } = lstatSync(join(cwd, NESTED_DIRECTORY_NAME));

    expect(buildSourceMirrorManifest(cwd, [])).toStrictEqual({
      [NESTED_DIRECTORY_NAME]: { mtimeMs, size, target: TEST_FILENAME, type: SourceMirrorEntryType.Symlink },
    });
  });
});
