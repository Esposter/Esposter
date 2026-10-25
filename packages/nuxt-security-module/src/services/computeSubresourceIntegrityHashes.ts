import type { Nitro } from "nitro/types";

import { SRI_HASH_ALGORITHM } from "#src/runtime/constants";
import { generateHash } from "#src/runtime/services/generateHash";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";

// The integrity hash of every file the build serves from its public directory, keyed by the url the page names it by.
// The client bundles are written under `.nuxt/dist/client`, which Nuxt registers as a Nitro public asset. Nitro copies
// that into the public directory before this hook runs, so the hashes are read from that copy. The url takes the app's
// CDN when one is set, and the app's base url otherwise
export const computeSubresourceIntegrityHashes = async (nitro: Nitro): Promise<Record<string, string>> => {
  const { baseURL: appBaseUrl, cdnURL: appCdnUrl } = nitro.options.runtimeConfig.app;
  const { publicDir } = nitro.options.output;
  if (!existsSync(publicDir)) return {};

  // Recursive, since the client bundles sit under nested folders such as `_nuxt`
  const entries = await readdir(publicDir, { recursive: true, withFileTypes: true });
  const hashEntries = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const filePath = join(entry.parentPath, entry.name);
        const hash = await generateHash(await readFile(filePath), SRI_HASH_ALGORITHM);
        const fullPath = posix.join(...relative(publicDir, filePath).split(sep));
        const url = appCdnUrl
          ? new URL(fullPath, appCdnUrl.endsWith("/") ? appCdnUrl : `${appCdnUrl}/`).href
          : posix.join("/", appBaseUrl, fullPath);
        return [url, hash] as const;
      }),
  );

  return Object.fromEntries(hashEntries);
};
