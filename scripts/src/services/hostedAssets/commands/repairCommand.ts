import type { SubCommandsDef } from "citty";

import { createHostedAssetBucketClientMap } from "#src/services/hostedAssets/createHostedAssetBucketClientMap";
import { readHostedAssetProduct } from "#src/services/hostedAssets/readHostedAssetProduct";
import { readPublishedHostedAssetLock } from "#src/services/hostedAssets/readPublishedHostedAssetLock";
import { repairHostedAssets } from "#src/services/hostedAssets/repairHostedAssets";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";

export const repairCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
    product: { description: "The product whose missing objects are copied", required: true, type: "positional" },
  },
  meta: {
    description:
      "Copy each object or index the product's lock names that one environment's bucket lacks from the other environment's bucket, or with --dry-run, name each copy it would make. An object held by neither bucket needs the product republished from its source. Both buckets are read, so a dry run needs both credentials",
    name: "repair",
  },
  run: async ({ args }) => {
    const product = readHostedAssetProduct(args.product);
    console.log(
      await repairHostedAssets(
        product,
        await readPublishedHostedAssetLock(product.lockPath),
        createHostedAssetBucketClientMap(product.bucket),
        args["dry-run"],
      ),
    );
  },
});
