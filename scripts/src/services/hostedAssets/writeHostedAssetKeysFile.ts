import type { HostedAssetLock } from "hosted-assets";

import { getHostedAssetKeyPairs } from "#src/services/hostedAssets/getHostedAssetKeyPairs";
import { getHostedAssetKeysSource } from "#src/services/hostedAssets/getHostedAssetKeysSource";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

// The install's keys file, written from the web app's prepare step. That step runs before any package is built, so this
// Imports nothing a build produces, and writes with a plain file write where the publish writes atomically
export const writeHostedAssetKeysFile = async (
  productName: string,
  lockPath: string,
  keysPath: string,
  toName: (lockKey: string) => string,
): Promise<void> => {
  const lock: HostedAssetLock = parseMachineJson(await readFile(lockPath, "utf8"));
  await mkdir(dirname(keysPath), { recursive: true });
  await writeFile(
    keysPath,
    getHostedAssetKeysSource(
      productName,
      getHostedAssetKeyPairs(Object.keys(lock.objects), toName),
      getHostedAssetKeyPairs(Object.keys(lock.indexes), toName),
    ),
  );
};
