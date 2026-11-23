import type { SubCommandsDef } from "citty";

import { getHostedAssetFileKey } from "#src/services/hostedAssets/getHostedAssetFileKey";
import { pullHostedAssetFiles } from "#src/services/hostedAssets/pullHostedAssetFiles";
import { readHostedAssetLock } from "#src/services/hostedAssets/readHostedAssetLock";
import { readHostedAssetProduct } from "#src/services/hostedAssets/readHostedAssetProduct";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { defineCommand } from "citty";

export const pullCommand: SubCommandsDef[string] = defineCommand({
  args: {
    all: { description: "Pull every file the product's lock names", type: "boolean" },
    product: { description: "The product whose working copy is restored", required: true, type: "positional" },
    key: {
      description: "The file to pull, by its key under the product's folder",
      required: false,
      type: "positional",
    },
  },
  meta: {
    description:
      "Restore a files product's working copy from its objects on the dev hosted origin, one file by its key or every file with --all",
    name: "pull",
  },
  run: async ({ args }) => {
    const product = readHostedAssetProduct(args.product);
    const lock = await readHostedAssetLock(product.lockPath);
    const scope = takeOne(product.scopes);
    if (!args.all && args.key === undefined)
      throw new InvalidOperationError(Operation.Read, product.name, "needs a file key or --all");
    // The keys are the lock's keys under the product's scope, which a file's key under its folder is the rest of
    const keys = args.all
      ? Object.keys(lock.objects).map((lockKey) => getHostedAssetFileKey(scope, lockKey))
      : [args.key ?? ""];
    const count = await pullHostedAssetFiles(
      HostedAssetOriginMap[CloudflareEnvironment.Development],
      product,
      lock,
      keys,
      REPOSITORY_ROOT,
    );
    console.log(`${product.name}: ${count} files pulled`);
  },
});
