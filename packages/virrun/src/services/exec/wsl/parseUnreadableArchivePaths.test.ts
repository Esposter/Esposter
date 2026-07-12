import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { parseUnreadableArchivePaths } from "@/services/exec/wsl/parseUnreadableArchivePaths";
import { describe, expect, test } from "vitest";

describe(parseUnreadableArchivePaths, () => {
  // Both host tars' captured report shapes for a Windows-locked/permission-denied file, and their summary trailers.
  const BSDTAR_UNREADABLE_LINE = `tar.exe: Couldn't open ${TEST_FILENAME}: Permission denied`;
  const BSDTAR_TRAILER_LINE = "tar.exe: Error exit delayed from previous errors.";
  const GNU_UNREADABLE_LINE = `tar: ${TEST_FILENAME}: Cannot open: Permission denied`;
  const GNU_TRAILER_LINE = "tar: Exiting with failure status due to previous errors";

  test("collects bsdtar unreadable reports and ignores its trailer", () => {
    expect.hasAssertions();

    expect(parseUnreadableArchivePaths(`${BSDTAR_UNREADABLE_LINE}\r\n${BSDTAR_TRAILER_LINE}\r\n`)).toStrictEqual([
      TEST_FILENAME,
    ]);
  });

  test("collects GNU tar unreadable reports and ignores its trailer", () => {
    expect.hasAssertions();

    expect(parseUnreadableArchivePaths(`${GNU_UNREADABLE_LINE}\n${GNU_TRAILER_LINE}\n`)).toStrictEqual([TEST_FILENAME]);
  });

  test("returns undefined when any line is not a recognized unreadable report", () => {
    expect.hasAssertions();

    // Bsdtar loses the path on a vanished entry — unattributable, so the whole failure must surface.
    expect(
      parseUnreadableArchivePaths(
        `${BSDTAR_UNREADABLE_LINE}\ntar.exe: : Couldn't visit directory: No such file or directory\n${BSDTAR_TRAILER_LINE}`,
      ),
    ).toBeUndefined();
  });

  test("returns undefined when stderr holds no unreadable report at all", () => {
    expect.hasAssertions();

    expect(parseUnreadableArchivePaths("")).toBeUndefined();
    expect(parseUnreadableArchivePaths(`${BSDTAR_TRAILER_LINE}\n`)).toBeUndefined();
  });
});
