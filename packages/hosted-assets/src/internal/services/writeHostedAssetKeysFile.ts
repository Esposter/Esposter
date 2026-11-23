import { hostedAssetLockSchema } from "#src/models/HostedAssetLock";
import { getHostedAssetKeyPairs } from "#src/services/getHostedAssetKeyPairs";
import { getHostedAssetKeysSource } from "#src/services/getHostedAssetKeysSource";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";

// The install's keys file, written from the web app's prepare step
// That step runs before any package is built, so this imports nothing a build produces
// It writes with a plain file write, where the publish writes atomically
export const writeHostedAssetKeysFile = async (
  productName: string,
  lockPath: string,
  keysPath: string,
  toName: (lockKey: string) => string,
): Promise<void> => {
  // The install reads its lock before any workspace package is built, so @esposter/shared's
  // oxlint-disable-next-line no-restricted-properties -- date-aware parse is not loadable, and the lock holds no dates
  const lock = hostedAssetLockSchema.parse(JSON.parse(await readFile(lockPath, "utf8")));
  await mkdir(dirname(keysPath), { recursive: true });
  await writeFile(
    keysPath,
    getHostedAssetKeysSource(
      productName,
      basename(lockPath),
      getHostedAssetKeyPairs(Object.keys(lock.objects), toName),
      getHostedAssetKeyPairs(Object.keys(lock.indexes), toName),
    ),
  );
};
