import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The commits that touched a product's lock, newest first, for the arguments a `git log` is given
export const getCommitsOf = (product: HostedAssetProduct, args: string[]): string[] =>
  getNonEmptyLines(runGit(["log", ...args, "--format=%H", "--", product.lockRepositoryPath]));
