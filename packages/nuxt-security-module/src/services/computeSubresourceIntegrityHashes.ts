import type { Nitro } from "nitro/types";

import { SRI_HASH_ALGORITHM } from "#src/runtime/constants";
import { generateHash } from "#src/runtime/services/generateHash";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { posix } from "node:path";

// The integrity hash of every file the build serves from a public directory, keyed by the url the page names it by.
// The url takes the app's CDN when one is set, and the app's base url otherwise
export const computeSubresourceIntegrityHashes = async (nitro: Nitro): Promise<Record<string, string>> => {
  const { baseURL: appBaseUrl, cdnURL: appCdnUrl } = nitro.options.runtimeConfig.app;
  const existingPublicAssets = nitro.options.publicAssets.filter(({ dir: directory }) => existsSync(directory));
  const filesByPublicAsset = await Promise.all(
    existingPublicAssets.map(async ({ baseURL = "", dir: directory }) => {
      const entries = await readdir(directory, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => ({ filePath: posix.join(directory, entry.name), fullPath: posix.join(baseURL, entry.name) }));
    }),
  );
  const hashEntries = await Promise.all(
    filesByPublicAsset.flat().map(async ({ filePath, fullPath }) => {
      const hash = await generateHash(await readFile(filePath), SRI_HASH_ALGORITHM);
      const url = appCdnUrl
        ? new URL(
            posix.isAbsolute(fullPath) ? fullPath.slice(1) : fullPath,
            appCdnUrl.endsWith("/") ? appCdnUrl : `${appCdnUrl}/`,
          ).href
        : posix.join("/", appBaseUrl, fullPath);
      return [url, hash] as const;
    }),
  );

  return Object.fromEntries(hashEntries);
};
