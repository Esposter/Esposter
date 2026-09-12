import type { Packument } from "#src/models/updateNode/Packument";

import { fetchRegistry } from "#src/services/fetchRegistry";
import { getLatestVersionForPrefix } from "#src/services/updateNode/getLatestVersionForPrefix";
/** Fetch `pkg` from the npm registry and return its highest published version matching `prefix`. */
export const getRegistryLatestVersionForPrefix = async (pkg: string, prefix: string): Promise<string> => {
  const { versions } = await fetchRegistry<Packument>(pkg);
  return getLatestVersionForPrefix(Object.keys(versions), prefix);
};
