import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
} from "@/services/exec/wsl/constants";
import { createSourceMirrorArchive } from "@/services/exec/wsl/createSourceMirrorArchive";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(createSourceMirrorArchive, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // The planner's `<pid>.<uuid>` staging tag — opaque here, so the canonical minimal shape suffices.
  const TAG = `${process.pid}.0`;
  let cwd = "";
  let entryUnc = "";
  // Archive members as stored (posix relative paths); a directory member's trailing slash is normalized away so
  // Expectations read like the copyPaths that produced them.
  // Split on \r?\n — Windows bsdtar terminates member lines with \r\n.
  const listMembers = (archiveFilename: string): string[] =>
    execFileHidden("tar", ["-tf", join(entryUnc, archiveFilename)])
      .split(/\r?\n/u)
      .filter(Boolean)
      .map((member) => (member.endsWith("/") ? member.slice(0, -1) : member));

  beforeEach(() => {
    cwd = create();
    entryUnc = create();
  });

  afterEach(cleanup);

  test("archives exactly the listed entries without recursing and consumes the copy list", () => {
    expect.hasAssertions();

    const directoryName = "sub";
    const listedChildPath = `${directoryName}/listed`;
    const skippedChildPath = `${directoryName}/skipped`;
    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);
    mkdirSync(join(cwd, directoryName));
    writeFileSync(join(cwd, listedChildPath), TEST_FILENAME);
    writeFileSync(join(cwd, skippedChildPath), TEST_FILENAME);

    const archiveFilename = createSourceMirrorArchive(
      cwd,
      entryUnc,
      [TEST_FILENAME, directoryName, listedChildPath],
      TAG,
    );

    expect(archiveFilename).toBe(`${VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX}${TAG}`);
    // A listed directory contributes its entry alone — its children are mirrored only when listed themselves, exactly
    // Matching the manifest's per-entry bookkeeping.
    expect(listMembers(archiveFilename).toSorted()).toStrictEqual(
      [TEST_FILENAME, directoryName, listedChildPath].toSorted(),
    );
    // The copy list is consumed and unlinked during planning; only the archive stays staged for the script.
    expect(readdirSync(entryUnc)).toStrictEqual([archiveFilename]);
  });

  test("null-delimits the copy list so a filename with spaces survives", () => {
    expect.hasAssertions();

    const spacedFilename = `${TEST_FILENAME} ${TEST_FILENAME}`;
    writeFileSync(join(cwd, spacedFilename), TEST_FILENAME);

    expect(listMembers(createSourceMirrorArchive(cwd, entryUnc, [spacedFilename], TAG))).toStrictEqual([
      spacedFilename,
    ]);
  });

  test("throws on an unreadable source path and leaves the copy list staged for the reaper", () => {
    expect.hasAssertions();

    expect(() => createSourceMirrorArchive(cwd, entryUnc, [TEST_FILENAME], TAG)).toThrow();
    expect(readdirSync(entryUnc)).toContain(`${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${TAG}`);
  });
});
