import type { SubCommandsDef } from "citty";

import { fillHostedAssetMirror } from "#src/services/hostedAssets/fillHostedAssetMirror";
import { getHostedAssetProducts } from "#src/services/hostedAssets/getHostedAssetProducts";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { defineCommand } from "citty";

export const fillCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Fill the local mirror with every object each product's lock reaches, read from the dev origin, and check each object against its name",
    name: "fill",
  },
  run: async () => {
    // Every product is filled from its own declaration, so a product added later is covered with nothing else edited.
    // A failed object throws, which fails the step, so a fill that returns has no failures
    /* oxlint-disable no-await-in-loop -- Bounded concurrency: one product's fill holds a wave of
       MAX_CONCURRENT_MIRROR_DOWNLOADS downloads, so the products fill one after another, never two waves at once */
    for (const product of getHostedAssetProducts()) {
      const lock = await readHostedAssetLock(product.lockPath);
      const count = await fillHostedAssetMirror(HostedAssetOriginMap[CloudflareEnvironment.Development], lock);
      console.log(`${product.lockRepositoryPath}: ${count} objects in the mirror, 0 failures`);
    }
    /* oxlint-enable no-await-in-loop */
  },
});
