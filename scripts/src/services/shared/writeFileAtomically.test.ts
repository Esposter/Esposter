import { writeFileAtomically } from "#src/services/shared/writeFileAtomically";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeFileAtomically, () => {
  const TEST_PREFIX = "file-";
  const NESTED_DIRECTORY = "nested";
  const FILENAME = "file.json";
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), TEST_PREFIX));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("replaces the file, creating its directory and leaving no temporary file beside it", () => {
    expect.hasAssertions();

    const path = join(root, NESTED_DIRECTORY, FILENAME);
    writeFileAtomically(path, "first");
    writeFileAtomically(path, "second");

    expect(readFileSync(path, "utf8")).toBe("second");
    expect(readdirSync(join(root, NESTED_DIRECTORY))).toStrictEqual([FILENAME]);
  });
});
