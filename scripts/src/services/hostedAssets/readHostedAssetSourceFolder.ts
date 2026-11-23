import type { HostedAssetSourceFile } from "#src/models/hostedAssets/HostedAssetSourceFile";

import { assertHostedAssetSource } from "#src/services/hostedAssets/assertHostedAssetSource";
import { MAX_CONCURRENT_OBJECT_BODIES } from "#src/services/hostedAssets/constants";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { getContentAddress } from "@esposter/shared-node/cache";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

// A file's key under its folder, with `/` between segments whatever the platform's separator
const toKey = (directory: string, path: string): string => relative(directory, path).split(sep).join("/");

// Every file under a product's source folder, in path order. A file of an unhosted extension is kept out before it is
// Read, Since it is code or an authoring source the product never publishes. The folder is named from the repository
// Root, so a Refusal names the file by its repository path. Each other file is refused by the placement rules before
// Its bytes are read
export const readHostedAssetSourceFolder = async (
  repositoryRoot: string,
  folder: string,
  unhostedExtensions: readonly string[],
): Promise<HostedAssetSourceFile[]> => {
  const directory = join(repositoryRoot, folder);
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  // A symbolic link is refused by name whatever its extension, before the unhosted filter, since a walk that skipped it
  // Would Drop its key from the lock without a word
  const link = entries.find((entry) => entry.isSymbolicLink());
  if (link !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      `${folder}/${toKey(directory, join(link.parentPath, link.name))}`,
      "is a symbolic link, which a publish does not follow",
    );
  const paths = entries
    .filter((entry) => entry.isFile() && !unhostedExtensions.includes(extname(entry.name)))
    .map((entry) => join(entry.parentPath, entry.name))
    .toSorted();
  return settleAll(
    paths.map((path) => async () => {
      const key = toKey(directory, path);
      const name = `${folder}/${key}`;
      assertHostedAssetSource({ bytes: (await stat(path)).size, path: name });
      const bytes = await readFile(path);
      return { bytes, extension: extname(name), key, sha256: getContentAddress(bytes) };
    }),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
};
