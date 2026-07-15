import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { getIsTolerableArchiveFailure } from "@/services/exec/wsl/getIsTolerableArchiveFailure";
import { describe, expect, test } from "vitest";

describe(getIsTolerableArchiveFailure, () => {
  // Both host tars' captured report shapes for the two per-entry skips — a Windows-locked/permission-denied file and a
  // Path that vanished since the manifest walk — and their summary trailers. Bsdtar names no path on the vanished one.
  const BSDTAR_UNREADABLE_LINE = `tar.exe: Couldn't open ${TEST_FILENAME}: Permission denied`;
  const BSDTAR_VANISHED_LINE = "tar.exe: : Couldn't visit directory: No such file or directory";
  const BSDTAR_TRAILER_LINE = "tar.exe: Error exit delayed from previous errors.";
  const GNU_UNREADABLE_LINE = `tar: ${TEST_FILENAME}: Cannot open: Permission denied`;
  const GNU_VANISHED_LINE = `tar: ${TEST_FILENAME}: Cannot stat: No such file or directory`;
  const GNU_TRAILER_LINE = "tar: Exiting with failure status due to previous errors";

  test("tolerates bsdtar's per-entry skips and ignores its trailer", () => {
    expect.hasAssertions();

    expect(
      getIsTolerableArchiveFailure(
        `${BSDTAR_UNREADABLE_LINE}\r\n${BSDTAR_VANISHED_LINE}\r\n${BSDTAR_TRAILER_LINE}\r\n`,
      ),
    ).toBe(true);
  });

  test("tolerates GNU tar's per-entry skips and ignores its trailer", () => {
    expect.hasAssertions();

    expect(getIsTolerableArchiveFailure(`${GNU_UNREADABLE_LINE}\n${GNU_VANISHED_LINE}\n${GNU_TRAILER_LINE}\n`)).toBe(
      true,
    );
  });

  test("rejects a failure whose reports are not all per-entry skips", () => {
    expect.hasAssertions();

    // Anything tar did not archive past leaves an untrustworthy archive, however many benign lines accompany it.
    expect(
      getIsTolerableArchiveFailure(
        `${BSDTAR_UNREADABLE_LINE}\ntar.exe: Option --nope is not supported\n${BSDTAR_TRAILER_LINE}`,
      ),
    ).toBe(false);
  });

  test("rejects a failure with no report at all", () => {
    expect.hasAssertions();

    expect(getIsTolerableArchiveFailure("")).toBe(false);
    expect(getIsTolerableArchiveFailure(`${BSDTAR_TRAILER_LINE}\n`)).toBe(false);
  });
});
