import { DATA_FILES, DATA_FOLDERS } from "#src/services/fleet/data/constants";
import { getManifest } from "#src/services/fleet/data/getManifest";
import { takeOne } from "@esposter/shared";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(getManifest, () => {
  const FOLDER = takeOne(DATA_FOLDERS, 0);
  const CONFIG_FILE = takeOne(DATA_FILES, 0);
  let parityDirectory: string;

  beforeEach(async () => {
    parityDirectory = await mkdtemp(join(tmpdir(), "fleet-manifest-"));
  });

  afterEach(async () => {
    await rm(parityDirectory, { force: true, recursive: true });
  });

  test("digests a single-file entry beside the folders it names", async () => {
    expect.hasAssertions();

    await mkdir(join(parityDirectory, FOLDER));
    await writeFile(join(parityDirectory, CONFIG_FILE), "");

    const manifest = await getManifest(parityDirectory, [FOLDER, CONFIG_FILE]);
    expect(Object.keys(manifest)).toStrictEqual([FOLDER, CONFIG_FILE]);
  });

  test("changes a single-file entry's digest when the file changes", async () => {
    expect.hasAssertions();

    await writeFile(join(parityDirectory, CONFIG_FILE), "");
    const before = await getManifest(parityDirectory, [CONFIG_FILE]);

    await writeFile(join(parityDirectory, CONFIG_FILE), " ");
    await expect(getManifest(parityDirectory, [CONFIG_FILE])).resolves.not.toStrictEqual(before);
  });

  test("digests nothing for an entry the parity directory does not hold", async () => {
    expect.hasAssertions();

    await expect(getManifest(parityDirectory, [CONFIG_FILE])).resolves.toStrictEqual({});
  });
});
