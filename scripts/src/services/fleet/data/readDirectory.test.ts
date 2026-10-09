import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readDirectory, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "read-directory-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // Tar keeps a file's mtime in whole seconds, so a source's fraction past the half would round to a second its copy
  // Never reads, and the file would be selected again on every sync
  test("truncates a file's mtime to the second, as tar writes it", async () => {
    expect.hasAssertions();

    const path = join(directory, "file");
    writeFileSync(path, "");
    utimesSync(path, 10.7, 10.7);
    const { files } = await readDirectory(directory);

    expect(files).toStrictEqual([{ mtime: 10, name: "file", size: 0 }]);
  });
});
