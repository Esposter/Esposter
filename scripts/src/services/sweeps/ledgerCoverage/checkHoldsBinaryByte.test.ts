import { MEBIBYTE } from "#src/services/shared/constants";
import { checkHoldsBinaryByte } from "#src/services/sweeps/ledgerCoverage/checkHoldsBinaryByte";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(checkHoldsBinaryByte, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "check-holds-binary-byte-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // A file a mebibyte long, the NUL in its last byte, so a check that read only the first chunk would miss it
  test.each([
    ["a NUL past the first chunk", Buffer.concat([Buffer.alloc(MEBIBYTE, "a"), Buffer.from([0])]), true],
    ["no NUL in the whole file", Buffer.alloc(MEBIBYTE, "a"), false],
  ])("finds %s", (_description, contents, expected) => {
    expect.hasAssertions();

    const path = join(directory, "file");
    writeFileSync(path, contents);

    expect(checkHoldsBinaryByte(path)).toBe(expected);
  });
});
