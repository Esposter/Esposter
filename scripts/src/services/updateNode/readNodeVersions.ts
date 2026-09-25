import type { NodeRelease } from "#src/models/updateNode/NodeRelease";

import { fetchJson } from "#src/services/shared/fetchJson";
import { NODE_DIST_INDEX_URL } from "#src/services/updateNode/constants";

/** Every node release nodejs.org publishes, without the leading `v`. */
export const readNodeVersions = async (): Promise<string[]> => {
  const releases = await fetchJson<NodeRelease[]>(NODE_DIST_INDEX_URL);
  return releases.map(({ version }) => version.replace(/^v/u, ""));
};
