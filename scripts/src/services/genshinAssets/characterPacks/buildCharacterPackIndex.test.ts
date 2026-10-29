import { buildCharacterPackIndex } from "#src/services/genshinAssets/characterPacks/buildCharacterPackIndex";
import { readCharacterPackFiles } from "#src/services/genshinAssets/characterPacks/readCharacterPackFiles";
import { InvalidOperationError } from "@esposter/shared";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const getSha256 = (content: string): string => createHash("sha256").update(content).digest("hex");

// An avatar's folder as the owner's extraction leaves it: each file, then the manifest listing them by path, bytes and
// Hash. Returns the manifest's text, which the index holds the manifest file under
const writePack = (directory: string, avatarId: string, name: string | null, files: Record<string, string>): string => {
  const avatarDirectory = join(directory, avatarId);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(avatarDirectory, path)), { recursive: true });
    writeFileSync(join(avatarDirectory, path), content);
  }
  const manifest = JSON.stringify({
    avatarId,
    files: Object.entries(files).map(([path, content]) => ({
      bytes: Buffer.byteLength(content),
      path,
      sha256: getSha256(content),
    })),
    name,
  });
  writeFileSync(join(avatarDirectory, "manifest.json"), manifest);
  return manifest;
};

describe(buildCharacterPackIndex, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "character-packs-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("Index lists each avatar's files", async () => {
    expect.hasAssertions();

    const firstManifest = writePack(directory, "10000006", "丽莎", {
      "Texture/body.png": "body",
      "terms/readme.txt": "terms",
    });
    const secondManifest = writePack(directory, "10000007", "女主角", { "Texture/hair.png": "hair" });

    expect(await buildCharacterPackIndex(await readCharacterPackFiles(directory))).toStrictEqual({
      avatars: [
        {
          avatarId: 10000006,
          files: [
            { bytes: 4, path: "Texture/body.png", sha256: getSha256("body") },
            { bytes: 5, path: "terms/readme.txt", sha256: getSha256("terms") },
            { bytes: Buffer.byteLength(firstManifest), path: "manifest.json", sha256: getSha256(firstManifest) },
          ],
          name: "丽莎",
        },
        {
          avatarId: 10000007,
          files: [
            { bytes: 4, path: "Texture/hair.png", sha256: getSha256("hair") },
            { bytes: Buffer.byteLength(secondManifest), path: "manifest.json", sha256: getSha256(secondManifest) },
          ],
          name: "女主角",
        },
      ],
    });
  });

  // The extraction writes a null name for a pack it could not name, which the index keeps as an empty name
  test("an avatar whose manifest names none is indexed with an empty name", async () => {
    expect.hasAssertions();

    writePack(directory, "10000026", null, { "Texture/body.png": "body" });

    expect(
      (await buildCharacterPackIndex(await readCharacterPackFiles(directory))).avatars.map(({ name }) => name),
    ).toStrictEqual([""]);
  });

  test("a file its manifest does not list is refused, so the index never leaves out what the upload publishes", async () => {
    expect.hasAssertions();

    writePack(directory, "10000006", "丽莎", { "Texture/body.png": "body" });
    writeFileSync(join(directory, "10000006", "Texture", "extra.png"), "extra");

    await expect(buildCharacterPackIndex(await readCharacterPackFiles(directory))).rejects.toThrowError(
      InvalidOperationError,
    );
  });

  test("a file whose content does not hash to its manifest's sha256 is refused, so the index never names other content", async () => {
    expect.hasAssertions();

    mkdirSync(join(directory, "10000006", "Texture"), { recursive: true });
    writeFileSync(join(directory, "10000006", "Texture", "body.png"), "body");
    writeFileSync(
      join(directory, "10000006", "manifest.json"),
      JSON.stringify({
        avatarId: "10000006",
        files: [{ bytes: 4, path: "Texture/body.png", sha256: getSha256("other") }],
        name: "丽莎",
      }),
    );

    await expect(
      buildCharacterPackIndex(await readCharacterPackFiles(directory)),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 10000006/Texture/body.png, is listed by its manifest at a sha256 its bytes do not hash to]`,
    );
  });
});
