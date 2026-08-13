import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { findUpFile } from "@/services/exec/util/findUpFile";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(findUpFile, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  test("finds the file in cwd itself", () => {
    expect.hasAssertions();

    const root = create();
    const file = join(root, TEST_FILENAME);
    writeFileSync(file, "");

    expect(findUpFile(TEST_FILENAME, root)).toBe(file);
  });

  test("walks up to the nearest ancestor holding the file", () => {
    expect.hasAssertions();

    const root = create();
    const file = join(root, TEST_FILENAME);
    writeFileSync(file, "");
    const nestedDirectory = join(root, `${TEST_FILENAME}${TEST_FILENAME}`, `${TEST_FILENAME}${TEST_FILENAME}`);
    mkdirSync(nestedDirectory, { recursive: true });

    expect(findUpFile(TEST_FILENAME, nestedDirectory)).toBe(file);
  });

  test("returns undefined when the file is absent up to the root", () => {
    expect.hasAssertions();

    expect(findUpFile(TEST_FILENAME, create())).toBeUndefined();
  });

  test("skips a directory bearing the target name — only a regular file matches", () => {
    expect.hasAssertions();

    const root = create();
    mkdirSync(join(root, TEST_FILENAME));

    expect(findUpFile(TEST_FILENAME, join(root, TEST_FILENAME))).toBeUndefined();
  });
});
