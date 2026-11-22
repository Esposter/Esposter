import { buildCharacterPackIndex } from "#src/services/genshinAssets/characterPacks/buildCharacterPackIndex";
import { CHARACTER_PACK_MANIFEST_NAME } from "#src/services/genshinAssets/characterPacks/constants";
import { readCharacterPackFiles } from "#src/services/genshinAssets/characterPacks/readCharacterPackFiles";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

const getSha256 = (content: string): string => createHash("sha256").update(content).digest("hex");

// An avatar's folder as the owner's extraction leaves it: each file, then the manifest listing them by path, bytes and
// SHA-256 hash, in the order given. The index lists them in that order.
const writePack = (
  directory: string,
  avatarId: string,
  name: string | undefined,
  files: { content: string; path: string }[],
): void => {
  const avatarDirectory = join(directory, avatarId);
  for (const { content, path } of files) {
    mkdirSync(dirname(join(avatarDirectory, path)), { recursive: true });
    writeFileSync(join(avatarDirectory, path), content);
  }
  const manifest = JSON.stringify({
    avatarId,
    files: files.map(({ content, path }) => ({ bytes: Buffer.byteLength(content), path, sha256: getSha256(content) })),
    name,
  });
  writeFileSync(join(avatarDirectory, CHARACTER_PACK_MANIFEST_NAME), manifest);
};

describe(buildCharacterPackIndex, () => {
  const AVATAR_ID = "10000006";
  const AVATAR_NAME = "丽莎";
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "character-packs-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("index lists each avatar's files", async () => {
    expect.hasAssertions();

    writePack(directory, AVATAR_ID, AVATAR_NAME, [
      { content: "body", path: "Texture/body.png" },
      { content: "terms", path: "terms/readme.txt" },
    ]);
    writePack(directory, "10000007", "女主角", [{ content: "hair", path: "Texture/hair.png" }]);

    await expect(buildCharacterPackIndex(await readCharacterPackFiles(directory))).resolves.toStrictEqual({
      avatars: [
        {
          avatarId: Number(AVATAR_ID),
          files: [
            {
              bytes: 4,
              path: "Texture/body.png",
              sha256: "230d8358dc8e8890b4c58deeb62912ee2f20357ae92a5cc861b98e68fe31acb5",
            },
            {
              bytes: 5,
              path: "terms/readme.txt",
              sha256: "51d2361f4faea3bc8f9facdbc7d99abb555596a2e51f7b25fd3b41c93587e616",
            },
            {
              bytes: 277,
              path: CHARACTER_PACK_MANIFEST_NAME,
              sha256: "22a1ff0450c8557848043171c3185dfe480d6d403ae59ab086fabfe3211ed0ac",
            },
          ],
          name: AVATAR_NAME,
        },
        {
          avatarId: 10000007,
          files: [
            {
              bytes: 4,
              path: "Texture/hair.png",
              sha256: "4dc2159bba05da394c3b94c6f54354db1f1f43b321ac4bbdfc2f658237858c70",
            },
            {
              bytes: 166,
              path: CHARACTER_PACK_MANIFEST_NAME,
              sha256: "3ae9315555b2068757e6151feb1dd7d9188b8a3e70da09121052352bb4cd92d7",
            },
          ],
          name: "女主角",
        },
      ],
    });
  });

  // The extraction omits the name of a pack it could not name, which the index keeps as an empty name
  test("an avatar whose manifest names none is indexed with an empty name", async () => {
    expect.hasAssertions();

    writePack(directory, "10000026", undefined, [{ content: "body", path: "Texture/body.png" }]);

    expect(
      (await buildCharacterPackIndex(await readCharacterPackFiles(directory))).avatars.map(({ name }) => name),
    ).toStrictEqual([""]);
  });

  test("a file its manifest does not list is refused, so the index never leaves out what the upload publishes", async () => {
    expect.hasAssertions();

    writePack(directory, AVATAR_ID, AVATAR_NAME, [{ content: "body", path: "Texture/body.png" }]);
    writeFileSync(join(directory, AVATAR_ID, "Texture", "extra.png"), "");

    await expect(
      buildCharacterPackIndex(await readCharacterPackFiles(directory)),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: ${AVATAR_ID}, holds 3 files, where its manifest lists 2]`,
    );
  });

  test("a file whose content does not hash to its manifest's sha256 is refused, so the index never names other content", async () => {
    expect.hasAssertions();

    mkdirSync(join(directory, AVATAR_ID, "Texture"), { recursive: true });
    writeFileSync(join(directory, AVATAR_ID, "Texture", "body.png"), "body");
    writeFileSync(
      join(directory, AVATAR_ID, CHARACTER_PACK_MANIFEST_NAME),
      JSON.stringify({
        avatarId: AVATAR_ID,
        files: [{ bytes: 4, path: "Texture/body.png", sha256: getSha256("other") }],
        name: AVATAR_NAME,
      }),
    );

    await expect(
      buildCharacterPackIndex(await readCharacterPackFiles(directory)),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: ${AVATAR_ID}/Texture/body.png, is listed by its manifest at a sha256 its bytes do not hash to]`,
    );
  });
});
