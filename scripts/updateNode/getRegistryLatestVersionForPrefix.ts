import type { Packument } from "#scripts/updateNode/models/Packument";

import { fetchRegistry } from "#scripts/services/fetchRegistry";
import { getLatestVersionForPrefix } from "#scripts/updateNode/getLatestVersionForPrefix";
/** Fetch `pkg` from the npm registry and return its highest published version matching `prefix`. */
export const getRegistryLatestVersionForPrefix = async (pkg: string, prefix: string): Promise<string> => {
  const { versions } = await fetchRegistry<Packument>(pkg);
  return getLatestVersionForPrefix(Object.keys(versions), prefix);
};
