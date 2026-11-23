import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// A missing lock and a revision git cannot read both fail `cat-file`, so the commit is proved first: a revision that
// Names no commit throws, since reading it as no lock would let a prune take what its lock names
export const checkHasLockAt = (product: HostedAssetProduct, revision: string): boolean =>
  getResult(() => runGit(["cat-file", "-e", `${revision}:${product.lockRepositoryPath}`])).match(
    () => true,
    () => {
      // The commit is proved by the call below, so a lock git cannot find in it is missing rather than unreadable
      runGit(["cat-file", "-e", `${revision}^{commit}`]);
      return false;
    },
  );
