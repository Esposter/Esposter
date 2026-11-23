import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";
import type { HostedAssetLock } from "hosted-assets";

import { getLockDifferences } from "#src/services/hostedAssets/getLockDifferences";
import { readLockAt } from "#src/services/hostedAssets/readLockAt";
import { verifyHostedAssets } from "#src/services/hostedAssets/verifyHostedAssets";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The lock on disk is the one a publish wrote, and it must be the one committed, since every checkout reads the committed
// One, so a publish whose lock was not committed fails here before any bucket is read. Then every object the lock reaches
// Is fetched from both environments' origins, the buckets being read-only and independent, and each failure is named by its
// Environment, since a network error from fetch carries no URL of its own
export const verifyHostedAssetProduct = async (product: HostedAssetProduct, lock: HostedAssetLock): Promise<void> => {
  const differences = getLockDifferences(lock, readLockAt(product, "HEAD"));
  if (differences.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      `${product.name} lock`,
      `differs from the committed lock at ${differences.join(", ")}`,
    );
  const environments = Object.values(CloudflareEnvironment);
  const settled = await Promise.allSettled(
    environments.map((environment) => verifyHostedAssets(HostedAssetOriginMap[environment], lock)),
  );
  const failures: string[] = [];
  for (const [index, result] of settled.entries()) {
    const environment = environments[index];
    if (result.status === "fulfilled") console.log(`${environment}: ${result.value} objects verified`);
    else
      failures.push(
        `${environment}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      );
  }
  if (failures.length > 0) throw new InvalidOperationError(Operation.Read, product.name, failures.join("\n"));
};
