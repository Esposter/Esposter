import type { CharacterPackFile } from "#src/models/genshinAssets/characterPacks/CharacterPackFile";
import type { CharacterPackIndex } from "genshin-world";

import { characterPackManifestSchema } from "#src/models/genshinAssets/characterPacks/CharacterPackManifest";
import { CHARACTER_PACK_MANIFEST_NAME } from "#src/services/genshinAssets/characterPacks/constants";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// An avatar's entry in the index, read from the listing of its folder: its manifest's files, each checked against the
// Bytes and sha256 the folder holds, then the manifest itself, hashed since no manifest lists its own file. A manifest
// Naming another avatar, a file the folder lacks or holds at other bytes or other content, and a file the manifest does
// Not list are refused, so the index and the upload, both read from this one listing, cannot disagree about what a pack
// Holds
export const toCharacterPackAvatar = async (
  avatarId: string,
  files: CharacterPackFile[],
): Promise<CharacterPackIndex["avatars"][number]> => {
  const manifestFile = files.find(({ path }) => path === CHARACTER_PACK_MANIFEST_NAME);
  if (manifestFile === undefined) throw new InvalidOperationError(Operation.Read, avatarId, "holds no manifest.json");

  const manifestBytes = await readFile(manifestFile.localPath);
  const manifest = characterPackManifestSchema.parse(parseMachineJson(manifestBytes.toString("utf8")));
  if (manifest.avatarId !== avatarId)
    throw new InvalidOperationError(Operation.Read, avatarId, "has a manifest that names another avatar");

  const pathSizeMap = new Map(files.map(({ path, size }) => [path, size]));
  const mismatch = manifest.files.find(({ bytes, path }) => pathSizeMap.get(path) !== bytes);
  if (mismatch !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      `${avatarId}/${mismatch.path}`,
      "is listed by its manifest at other bytes than the folder holds",
    );

  const manifestSha256 = createHash("sha256").update(manifestBytes).digest("hex");
  const pathHashMap = new Map(
    await Promise.all(
      files.map(
        async ({ localPath, path }) =>
          [path, path === CHARACTER_PACK_MANIFEST_NAME ? manifestSha256 : await getFileSha256(localPath)] as const,
      ),
    ),
  );
  const unhashed = manifest.files.find(({ path, sha256 }) => pathHashMap.get(path) !== sha256);
  if (unhashed !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      `${avatarId}/${unhashed.path}`,
      "is listed by its manifest at a sha256 its bytes do not hash to",
    );

  const manifestIndexFile = { bytes: manifestFile.size, path: CHARACTER_PACK_MANIFEST_NAME, sha256: manifestSha256 };
  const indexFiles = [...manifest.files, manifestIndexFile];
  if (files.length !== indexFiles.length)
    throw new InvalidOperationError(
      Operation.Read,
      avatarId,
      `holds ${files.length} files, where its manifest lists ${indexFiles.length}`,
    );

  return { avatarId: Number(avatarId), files: indexFiles, name: manifest.name ?? "" };
};
