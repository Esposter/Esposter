import type { SubCommandsDef } from "citty";

import { publishHostedAssetFiles } from "#src/services/hostedAssets/publishHostedAssetFiles";
import { readHostedAssetProduct } from "#src/services/hostedAssets/readHostedAssetProduct";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";

export const publishCommand: SubCommandsDef[string] = defineCommand({
  args: {
    ...dryRunArgs,
    product: { description: "The product whose folder is published", required: true, type: "positional" },
  },
  meta: {
    description:
      "Publish a files product's folder to both environments and commit its lock, or with --dry-run, name each object that would be published",
    name: "publish",
  },
  run: async ({ args }) => {
    console.log(await publishHostedAssetFiles(readHostedAssetProduct(args.product), args["dry-run"]));
  },
});
