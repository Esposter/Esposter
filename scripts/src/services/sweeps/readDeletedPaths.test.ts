import { readDeletedPaths } from "#src/services/sweeps/readDeletedPaths";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readDeletedPaths, () => {
  const TEST_PREFIX = "deleted-";
  const KEPT_FILENAME = "kept.md";
  const NESTED_DIRECTORY = "nested";
  const DELETED_FILENAME = "deleted.md";
  const GONE_DIRECTORY = "gone";
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), TEST_PREFIX));
    writeFileSync(join(root, KEPT_FILENAME), "");
    mkdirSync(join(root, NESTED_DIRECTORY));
    writeFileSync(join(root, NESTED_DIRECTORY, KEPT_FILENAME), "");
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("names the listed paths whose files are gone, and no others", () => {
    expect.hasAssertions();

    expect(
      readDeletedPaths([KEPT_FILENAME, `${NESTED_DIRECTORY}/${KEPT_FILENAME}`, DELETED_FILENAME], root),
    ).toStrictEqual(new Set([DELETED_FILENAME]));
  });

  test("names every listed path under a directory that is gone", () => {
    expect.hasAssertions();

    expect(
      readDeletedPaths([`${GONE_DIRECTORY}/${KEPT_FILENAME}`, `${GONE_DIRECTORY}/${DELETED_FILENAME}`], root),
    ).toStrictEqual(new Set([`${GONE_DIRECTORY}/${DELETED_FILENAME}`, `${GONE_DIRECTORY}/${KEPT_FILENAME}`]));
  });
});
