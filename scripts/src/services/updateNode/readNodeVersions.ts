import type { NodeRelease } from "#src/models/updateNode/NodeRelease";

import { REGISTRY_FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { NODE_DIST_INDEX_URL } from "#src/services/updateNode/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
/** Every node release nodejs.org publishes, without the leading `v`. */
export const readNodeVersions = async (): Promise<string[]> => {
  const response = await fetch(NODE_DIST_INDEX_URL, { signal: AbortSignal.timeout(REGISTRY_FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(
      Operation.Read,
      readNodeVersions.name,
      `${NODE_DIST_INDEX_URL}: ${response.status} ${response.statusText}`,
    );

  const releases = (await response.json()) as NodeRelease[];
  return releases.map(({ version }) => version.replace(/^v/u, ""));
};
