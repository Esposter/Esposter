import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGit } from "#src/services/shared/runGit";
import { hostedAssetLockSchema } from "hosted-assets";

// A lock that exists but does not parse throws, since skipping it would let a prune take what it names
export const readLockAt = (product: HostedAssetProduct, revision: string): HostedAssetLock =>
  hostedAssetLockSchema.parse(parseMachineJson(runGit(["show", `${revision}:${product.lockRepositoryPath}`])));
