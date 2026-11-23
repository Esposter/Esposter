import type { SubCommandsDef } from "citty";

import { fillHostedAssetMirror } from "#src/services/hostedAssets/fillHostedAssetMirror";
import { getHostedAssetBaseUrl } from "#src/services/hostedAssets/getHostedAssetBaseUrl";
import { getHostedAssetProducts } from "#src/services/hostedAssets/getHostedAssetProducts";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { CloudflareEnvironment } from "@esposter/db-schema";
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
    const lines = await Promise.all(
      getHostedAssetProducts().map(async (product) => {
        const lock = await readHostedAssetLock(product.lockPath);
        const count = await fillHostedAssetMirror(
          getHostedAssetBaseUrl(CloudflareEnvironment.Development, product.bucket),
          lock,
        );
        return `${product.lockRepositoryPath}: ${count} objects in the mirror, 0 failures`;
      }),
    );
    for (const line of lines) console.log(line);
  },
});
