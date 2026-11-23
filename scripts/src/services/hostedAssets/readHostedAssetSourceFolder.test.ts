import { HOSTED_OBJECT_MAX_BYTES } from "#src/services/hostedAssets/constants";
import { readHostedAssetSourceFolder } from "#src/services/hostedAssets/readHostedAssetSourceFolder";
import { getContentAddress } from "@esposter/shared-node/cache";
import { mkdir, mkdtemp, rm, symlink, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readHostedAssetSourceFolder, () => {
  const folder = "sources";
  let repositoryRoot: string;

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), "hosted-asset-source-"));
    await mkdir(join(repositoryRoot, folder));
  });

  afterEach(async () => {
    await rm(repositoryRoot, { force: true, recursive: true });
  });

  test("a WAV file is refused", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, "sound.wav"), "a");

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: sources/sound.wav, is lossless or uncompressed audio, which is published as MP3 instead]`,
    );
  });

  test("a file over the cap is refused", async () => {
    expect.hasAssertions();

    // Sized without being written, so the refusal is made on the size the reader stats, before it reads the file
    await writeFile(join(repositoryRoot, folder, "large.png"), "");
    await truncate(join(repositoryRoot, folder, "large.png"), HOSTED_OBJECT_MAX_BYTES + 1);

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: sources/large.png, is over the 16777216 byte cap]`,
    );
  });

  test("a file whose extension has no content type is refused", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, "notes.xyz"), "a");

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: sources/notes.xyz, has an extension with no content type]`,
    );
  });

  // A dangling link is enough, since the walk refuses the entry by its name before it reads any target
  test("a symbolic link is refused by name, not skipped", async () => {
    expect.hasAssertions();

    await symlink(join(repositoryRoot, "elsewhere.png"), join(repositoryRoot, folder, "link.png"));

    await expect(readHostedAssetSourceFolder(repositoryRoot, folder, [])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: sources/link.png, is a symbolic link, which a publish does not follow]`,
    );
  });

  test("a file the code never loads is not hosted", async () => {
    expect.hasAssertions();

    await writeFile(join(repositoryRoot, folder, "map.ts"), "a");
    await writeFile(join(repositoryRoot, folder, "tile.png"), "b");

    const files = await readHostedAssetSourceFolder(repositoryRoot, folder, [".ts"]);

    expect(files.map(({ key }) => key)).toStrictEqual(["tile.png"]);
  });

  test("every file is read in key order, named by the hash of its bytes", async () => {
    expect.hasAssertions();

    await mkdir(join(repositoryRoot, folder, "tiles"));
    await writeFile(join(repositoryRoot, folder, "tiles", "grass.png"), "a");
    await writeFile(join(repositoryRoot, folder, "stats.json"), "b");

    const files = await readHostedAssetSourceFolder(repositoryRoot, folder, []);

    expect(files.map(({ key }) => key)).toStrictEqual(["stats.json", "tiles/grass.png"]);
    expect(files.map(({ bytes, sha256 }) => getContentAddress(bytes) === sha256)).toStrictEqual([true, true]);
  });
});
