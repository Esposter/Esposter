import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { BINARY_BYTE, CHUNK_BYTES } from "#src/services/sweeps/constants";
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

  // A file one byte longer than a chunk, the NUL in its last byte, so a check that read only the first chunk would
  // Miss it
  test.each([
    ["a NUL past the first chunk", Buffer.concat([Buffer.alloc(CHUNK_BYTES, "a"), Buffer.from([BINARY_BYTE])]), true],
    ["no NUL in the whole file", Buffer.alloc(CHUNK_BYTES + 1, "a"), false],
  ])("finds %s", (_description, contents, expected) => {
    expect.hasAssertions();

    const path = join(directory, TEST_FILENAME);
    writeFileSync(path, contents);

    expect(checkHoldsBinaryByte(path)).toBe(expected);
  });
});
