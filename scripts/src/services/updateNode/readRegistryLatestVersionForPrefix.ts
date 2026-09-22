import type { Packument } from "#src/models/updateNode/Packument";

import { fetchRegistry } from "#src/services/shared/fetchRegistry";
import { getLatestVersionForPrefix } from "#src/services/updateNode/getLatestVersionForPrefix";
/** Fetch `packageName` from the npm registry and return its highest published version matching `prefix`. */
export const readRegistryLatestVersionForPrefix = async (packageName: string, prefix: string): Promise<string> => {
  const { versions } = await fetchRegistry<Packument>(packageName);
  return getLatestVersionForPrefix(Object.keys(versions), prefix);
};
