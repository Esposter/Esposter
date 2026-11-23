import { HOSTED_OBJECT_MAX_BYTES } from "#src/services/hostedAssets/constants";
import { readHostedAssetSourceFolder } from "#src/services/hostedAssets/readHostedAssetSourceFolder";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getContentAddress } from "@esposter/shared-node/cache";
import { mkdir, mkdtemp, rm, symlink, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readHostedAssetSourceFolder, () => {
  const folder = TEST_FILENAME;
  let repositoryRoot: string;

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), TEST_FILENAME));
    await mkdir(join(repositoryRoot, folder));
  });

  afterEach(async () => {
    await rm(repositoryRoot, { force: true, recursive: true });
  });

  test("a WAV file is refused", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, `${TEST_FILENAME}.wav`), "");

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.wav, is lossless or uncompressed audio, which is published as MP3 or Ogg instead]`,
    );
  });

  test("a file over the cap is refused", async () => {
    expect.hasAssertions();

    // Sized without being written, so the refusal is made on the size the reader stats, before it reads the file
    await writeFile(join(repositoryRoot, folder, `${TEST_FILENAME}.png`), "");
    await truncate(join(repositoryRoot, folder, `${TEST_FILENAME}.png`), HOSTED_OBJECT_MAX_BYTES + 1);

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.png, is over the 16777216 byte cap]`,
    );
  });

  test("a file whose extension has no content type is refused", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, `${TEST_FILENAME}.gif`), "");

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.gif, has an extension with no content type]`,
    );
  });

  // A dangling link is enough, since the walk refuses the entry by its name before it reads any target
  test("a symbolic link is refused by name, not skipped", async () => {
    expect.hasAssertions();

    await symlink(join(repositoryRoot, `${TEST_FILENAME}.png`), join(repositoryRoot, folder, `${TEST_FILENAME}.png`));

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/a.png, is a symbolic link, which a publish does not follow]`,
    );
  });

  test("a file the code never loads is not hosted", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, `${TEST_FILENAME}.ts`), "");
    await writeFile(join(repositoryRoot, folder, `${TEST_FILENAME}.png`), "");

    const files = await readHostedAssetSourceFolder(repositoryRoot, folder, [".ts"]);

    expect(files.map(({ key }) => key)).toStrictEqual([`${TEST_FILENAME}.png`]);
  });

  // The link is refused although its extension is unhosted, since the refusal is made before the filter keeps files out
  test("a symbolic link of an unhosted extension is refused by name, not skipped", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, "tile.png"), "b");
    await symlink(join(repositoryRoot, "elsewhere.ts"), join(repositoryRoot, folder, "map.ts"));

    await expect(
      readHostedAssetSourceFolder(repositoryRoot, folder, [".ts"]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/map.ts, is a symbolic link, which a publish does not follow]`,
    );
  });

  test("every file is read in key order, named by the hash of its bytes", async () => {
    expect.hasAssertions();

    await mkdir(join(repositoryRoot, folder, TEST_FILENAME));
    await writeFile(join(repositoryRoot, folder, TEST_FILENAME, `${TEST_FILENAME}.png`), "");
    await writeFile(join(repositoryRoot, folder, `${TEST_FILENAME}.json`), " ");

    const files = await readHostedAssetSourceFolder(repositoryRoot, folder, []);

    expect(files.map(({ key }) => key)).toStrictEqual([
      `${TEST_FILENAME}.json`,
      `${TEST_FILENAME}/${TEST_FILENAME}.png`,
    ]);
    expect(files.map(({ bytes, sha256 }) => getContentAddress(bytes) === sha256)).toStrictEqual([true, true]);
  });
});
