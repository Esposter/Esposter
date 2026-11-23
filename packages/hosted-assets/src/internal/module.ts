import type { HostedAssetKeysModuleOptions } from "#src/models/HostedAssetKeysModuleOptions";

import { toHostedAssetFileKey } from "#src/internal/services/toHostedAssetFileKey";
import { writeHostedAssetKeysFile } from "#src/internal/services/writeHostedAssetKeysFile";
import { getHostedAssetFileKey } from "#src/services/getHostedAssetFileKey";
import { join } from "node:path";

// A derived name is the lock key's path after its scope, which is its first segment, cut by the file key's one owner
const toDerivedName = (lockKey: string): string =>
  toHostedAssetFileKey(getHostedAssetFileKey(lockKey.slice(0, lockKey.indexOf("/")), lockKey));

// The Nuxt module that writes a product's key map from its committed lock, once `nuxt prepare` has loaded the app
// It is registered by its source path in `apps/web/configuration/modules.ts`, since `nuxt prepare` runs before any package is built
// It lives under `internal`, so the build leaves it out of the entries, since it reads Node's file system
const hostedAssetKeysModule = (
  { isNameDerived, keysPath, lockPath, product }: HostedAssetKeysModuleOptions,
  nuxt: { hook: (name: "ready", callback: () => Promise<void>) => void; options: { rootDir: string } },
): void => {
  nuxt.hook("ready", () =>
    writeHostedAssetKeysFile(
      product,
      join(nuxt.options.rootDir, lockPath),
      join(nuxt.options.rootDir, keysPath),
      isNameDerived ? toDerivedName : (lockKey) => lockKey,
    ),
  );
};

export default hostedAssetKeysModule;
