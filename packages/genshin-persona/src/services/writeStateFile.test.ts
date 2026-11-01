import { TEST_FILENAME } from "#src/services/constants.test";
import { writeStateFile } from "#src/services/writeStateFile";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(writeStateFile, () => {
  let directory = "";

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "genshin-persona-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("creates the directory it writes into and writes the content whole", () => {
    expect.hasAssertions();

    const path = join(directory, TEST_FILENAME, TEST_FILENAME);
    const content = Uint8Array.from([1, 2, 3]);

    writeStateFile(path, content);

    expect(readFileSync(path)).toStrictEqual(Buffer.from(content));
  });

  test("replaces the previous content and leaves no temporary file beside it", () => {
    expect.hasAssertions();

    const path = join(directory, TEST_FILENAME);

    writeStateFile(path, "a");
    writeStateFile(path, "b");

    expect(readFileSync(path, "utf8")).toBe("b");
    expect(readdirSync(directory)).toStrictEqual([TEST_FILENAME]);
  });
});
