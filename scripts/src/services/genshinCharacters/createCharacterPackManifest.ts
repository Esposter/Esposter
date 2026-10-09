import type { CharacterPackFile } from "#src/models/genshinCharacters/CharacterPackFile";
import type { CharacterPackManifest } from "#src/models/genshinCharacters/CharacterPackManifest";

// The record a pack is published as: each file's hash by its path, in path order, so the record hashes the same
// Whatever order the pack's folder listed its files in
export const createCharacterPackManifest = (
  files: readonly Pick<CharacterPackFile, "hash" | "path">[],
): CharacterPackManifest => ({
  files: Object.fromEntries(
    files
      .map(({ hash, path }) => [path, hash] as const)
      .toSorted(([firstPath], [secondPath]) => (firstPath < secondPath ? -1 : 1)),
  ),
});
