import type { SubCommandsDef } from "citty";

import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { readHostedAssetProduct } from "#src/services/hostedAssets/readHostedAssetProduct";
import { verifyHostedAssetProduct } from "#src/services/hostedAssets/verifyHostedAssetProduct";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  args: { product: { description: "The product whose lock is verified", required: true, type: "positional" } },
  meta: {
    description:
      "Fetch every object a product's lock reaches from both environments' origins, anonymously, and check each hashes to its name, and that the lock on disk is the committed one",
    name: "verify",
  },
  run: async ({ args }) => {
    const product = readHostedAssetProduct(args.product);
    await verifyHostedAssetProduct(product, await readHostedAssetLock(product.lockPath));
  },
});
