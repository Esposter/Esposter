import type { HostedAssetSourceFile } from "#src/models/hostedAssets/HostedAssetSourceFile";

import { assertHostedAssetSource } from "#src/services/hostedAssets/assertHostedAssetSource";
import { MAX_CONCURRENT_OBJECT_BODIES } from "#src/services/hostedAssets/constants";
import { settleAll } from "@esposter/shared";
import { getContentAddress } from "@esposter/shared-node/cache";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

// Every file under a product's source folder, in key order. The folder is named from the repository root, so a refusal
// Names the file by its repository path. Each file is refused by the placement rules before its bytes are read
export const readHostedAssetSourceFolder = async (
  repositoryRoot: string,
  folder: string,
): Promise<HostedAssetSourceFile[]> => {
  const directory = join(repositoryRoot, folder);
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .toSorted();
  return settleAll(
    paths.map((path) => async () => {
      const key = relative(directory, path).split(sep).join("/");
      const name = `${folder}/${key}`;
      assertHostedAssetSource(folder, { bytes: (await stat(path)).size, path: name });
      const bytes = await readFile(path);
      return { bytes, extension: extname(name), key, sha256: getContentAddress(bytes) };
    }),
    MAX_CONCURRENT_OBJECT_BODIES,
  );
};
