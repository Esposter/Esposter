import type { ParityServer } from "#src/models/genshinParity/load/ParityServer";

import { startParityServer } from "#src/services/genshinParity/load/startParityServer";
import { checkIsPageStale } from "#src/services/genshinParity/page/checkIsPageStale";
import { getDistModifiedTimes } from "#src/services/genshinParity/page/getDistModifiedTimes";
import { getPageServerStartedAt } from "#src/services/genshinParity/shared/getPageServerStartedAt";
import { resolveParityPageRoot } from "#src/services/genshinParity/shared/resolveParityPageRoot";
import { getResultAsync } from "@esposter/shared";

// A fresh page for this run when the parity page on its port predates a build of the packages it draws: a server of its
// Own on a free port, with Vite's `--force` so its dependencies are bundled again. The parity page left running is not
// Touched. Undefined when that page is current, or when no page answers, which the run reports for itself. The caller
// Stops the fresh page when it is done
export const startFreshPageServer = async (): Promise<ParityServer | undefined> => {
  const pageRoot = (await getResultAsync(() => resolveParityPageRoot())).match(
    (root) => root,
    () => undefined,
  );
  if (pageRoot === undefined) return undefined;
  const port = Number(new URL(pageRoot).port);
  // A page whose start cannot be read is taken as current, since replacing it on a guess would measure nothing new
  const startedAt = getPageServerStartedAt(port);
  if (startedAt === undefined || !checkIsPageStale(startedAt, await getDistModifiedTimes())) return undefined;
  console.error(
    `the parity page on port ${port} predates a build of its packages, so this run measures a fresh one served with --force`,
  );
  return startParityServer(true, true);
};
