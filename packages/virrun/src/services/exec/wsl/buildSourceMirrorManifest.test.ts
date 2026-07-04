import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { NODE_MODULES_DIRECTORY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { buildSourceMirrorManifest } from "@/services/exec/wsl/buildSourceMirrorManifest";
import { getResult } from "@esposter/shared";
import { lstatSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const NESTED_DIRECTORY_NAME = "b";
// Windows only allows symlink creation with Developer Mode or elevation; probe once and skip the symlink case where
// The OS refuses, exactly as the walk itself degrades (an uncreatable symlink can't exist in a working tree there).
const isSymlinkSupported = getResult(() => {
  const directory = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  symlinkSync(TEST_FILENAME, join(directory, NESTED_DIRECTORY_NAME));
  rmSync(directory, { force: true, recursive: true });
}).match(
  () => true,
  () => false,
);

describe(buildSourceMirrorManifest, () => {
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

    const manifest = buildSourceMirrorManifest(cwd, []);

    expect(manifest).toStrictEqual({
      [`${NESTED_DIRECTORY_NAME}/${TEST_FILENAME}`]: expect.objectContaining({
        size: 0,
        type: SourceMirrorEntryType.File,
      }),
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

  test.runIf(isSymlinkSupported)("records a symlink by its target, not its content", () => {
    expect.hasAssertions();

    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
    symlinkSync(TEST_FILENAME, join(cwd, NESTED_DIRECTORY_NAME));

    const manifest = buildSourceMirrorManifest(cwd, []);

    expect(manifest[NESTED_DIRECTORY_NAME]).toStrictEqual({
      mtimeMs: 0,
      size: 0,
      target: TEST_FILENAME,
      type: SourceMirrorEntryType.Symlink,
    });
  });
});
