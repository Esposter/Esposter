import { DATA_FILES, DATA_FOLDERS, MILLISECONDS_PER_SECOND } from "#src/services/fleet/data/constants";
import { readEntryFiles } from "#src/services/fleet/data/readEntryFiles";
import { takeOne } from "@esposter/shared";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readEntryFiles, () => {
  const FOLDER = takeOne(DATA_FOLDERS, 0);
  const CONFIG_FILE = takeOne(DATA_FILES, 0);
  let parityDirectory: string;

  beforeEach(async () => {
    parityDirectory = await mkdtemp(join(tmpdir(), "fleet-entry-"));
  });

  afterEach(async () => {
    await rm(parityDirectory, { force: true, recursive: true });
  });

  // A single-file entry lists itself as its one file, named empty, so joining the entry with that name gives its own path
  test("lists a single-file entry as its one file, named empty", async () => {
    expect.hasAssertions();

    const configPath = join(parityDirectory, CONFIG_FILE);
    await writeFile(configPath, "");
    const { mtimeMs } = await stat(configPath);

    await expect(readEntryFiles(configPath)).resolves.toStrictEqual([
      { mtime: Math.round(mtimeMs / MILLISECONDS_PER_SECOND), name: "", size: 0 },
    ]);
  });

  test("lists a folder's direct files by their names", async () => {
    expect.hasAssertions();

    const folderPath = join(parityDirectory, FOLDER);
    const filePath = join(folderPath, CONFIG_FILE);
    await mkdir(folderPath);
    await writeFile(filePath, "");
    const { mtimeMs } = await stat(filePath);

    await expect(readEntryFiles(folderPath)).resolves.toStrictEqual([
      { mtime: Math.round(mtimeMs / MILLISECONDS_PER_SECOND), name: CONFIG_FILE, size: 0 },
    ]);
  });

  test("lists a missing entry as empty", async () => {
    expect.hasAssertions();

    await expect(readEntryFiles(join(parityDirectory, CONFIG_FILE))).resolves.toStrictEqual([]);
  });
});
