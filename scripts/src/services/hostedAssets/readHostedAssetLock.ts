import type { HostedAssetLock } from "hosted-assets";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { hostedAssetLockSchema } from "hosted-assets";
import { readFile } from "node:fs/promises";

// Read from disk on every call, never from a package's build.
// A build holds the lock of its last build, rather than the one an earlier step just wrote.
export const readHostedAssetLock = async (lockPath: string): Promise<HostedAssetLock> =>
  hostedAssetLockSchema.parse(parseMachineJson(await readFile(lockPath, "utf8")));
