import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { isSymlinkSupported } from "#src/services/exec/test/isSymlinkSupported.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { getTarExecutable } from "#src/services/exec/util/getTarExecutable";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
} from "#src/services/exec/wsl/constants";
import { createSourceMirrorArchive } from "#src/services/exec/wsl/createSourceMirrorArchive";
import { readSourceMirrorArchiveMembers } from "#src/services/exec/wsl/readSourceMirrorArchiveMembers";
import { getResult } from "@esposter/shared";
import { lstatSync, mkdirSync, readdirSync, readlinkSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(createSourceMirrorArchive, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  // The planner's `<pid>.<uuid>` staging tag — opaque here, so the canonical minimal shape suffices.
  const TAG = `${process.pid}.0`;
  let cwd = "";
  let entryUnc = "";
  const listMembers = (archiveFilename: string): string[] =>
    readSourceMirrorArchiveMembers(join(entryUnc, archiveFilename));

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

    const { archiveFilename, unarchivedPaths } = createSourceMirrorArchive(
      cwd,
      entryUnc,
      [TEST_FILENAME, directoryName, listedChildPath],
      TAG,
    );

    expect(archiveFilename).toBe(`${VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX}${TAG}`);
    expect(unarchivedPaths).toStrictEqual([]);
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

    expect(listMembers(createSourceMirrorArchive(cwd, entryUnc, [spacedFilename], TAG).archiveFilename)).toStrictEqual([
      spacedFilename,
    ]);
  });

  test.runIf(isSymlinkSupported)(
    "preserves a symlink member so it extracts as a link, not the target's content",
    () => {
      expect.hasAssertions();

      // The real regression: a package `eslint.config.js` links to a sibling dir whose file resolves its own imports
      // From that dir. Dereferencing (`tar -h`) copied the target's content into the link's location, so its relative
      // Resolution broke; preserving the link lets Node walk its realpath and resolve from the target's real directory.
      const siblingDirectoryName = "sibling";
      const linkTarget = `${siblingDirectoryName}/target`;
      const linkFilename = "link";
      mkdirSync(join(cwd, siblingDirectoryName));
      writeFileSync(join(cwd, linkTarget), TEST_FILENAME);
      symlinkSync(linkTarget, join(cwd, linkFilename));

      const { archiveFilename } = createSourceMirrorArchive(cwd, entryUnc, [linkFilename], TAG);

      const extractDirectory = create();
      execFileHidden(getTarExecutable(), ["-xf", join(entryUnc, archiveFilename), "-C", extractDirectory]);

      const extractedLinkPath = join(extractDirectory, linkFilename);

      expect(lstatSync(extractedLinkPath).isSymbolicLink()).toBe(true);
      // Windows `symlinkSync` normalizes the target separator to `\`; the intent is that the link (not the target's
      // Content) round-trips, so compare separator-agnostically — the real mirror's git symlinks are already posix.
      expect(readlinkSync(extractedLinkPath).replaceAll("\\", "/")).toBe(linkTarget);
    },
  );

  test("reports a listed path that vanished before the spawn and keeps the rest of the archive", () => {
    expect.hasAssertions();

    // The manifest walk and this spawn cannot be atomic, so a build output or editor temp listed a moment ago may be
    // Gone by now. Tar skips it, archives everything else, and exits non-zero — the plan must survive that, and bsdtar
    // Names no path on this report (`tar: : Couldn't visit directory`), so only the archive's members can attribute it.
    const vanishedFilename = "vanished";
    writeFileSync(join(cwd, TEST_FILENAME), TEST_FILENAME);

    const { archiveFilename, unarchivedPaths } = createSourceMirrorArchive(
      cwd,
      entryUnc,
      [TEST_FILENAME, vanishedFilename],
      TAG,
    );

    expect(unarchivedPaths).toStrictEqual([vanishedFilename]);
    expect(listMembers(archiveFilename)).toStrictEqual([TEST_FILENAME]);
    expect(readdirSync(entryUnc)).toStrictEqual([archiveFilename]);
  });

  test("throws when tar fails for anything but a per-entry skip and still consumes the copy list", () => {
    expect.hasAssertions();

    // An unusable `-C` root is a whole-spawn failure (`Cannot chdir`), not a report tar archived past — the archive
    // Holds nothing trustworthy, so the plan must abort loudly instead of pruning the entire manifest.
    // The message names absolute temp paths and a pid, and the two host tars word it differently — nothing
    // Reconstructable, so the abort is observed rather than snapshotted
    const isAborted = getResult(() =>
      createSourceMirrorArchive(join(cwd, "missing"), entryUnc, [TEST_FILENAME], TAG),
    ).match(
      () => false,
      () => true,
    );

    expect(isAborted).toBe(true);
    // Aborting is no reason to strand the list: tar is done with it either way, so it never reaches the reaper.
    expect(readdirSync(entryUnc)).not.toContain(`${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${TAG}`);
  });
});
