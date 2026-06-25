import type { Packument } from "@/services/models/Packument";

import { fetchRegistry } from "@/services/fetchRegistry";
import { getLatestVersionForPrefix } from "@/services/getLatestVersionForPrefix";
/** Fetch `pkg` from the npm registry and return its highest published version matching `prefix`. */
export const getRegistryLatestVersionForPrefix = async (pkg: string, prefix: string): Promise<string> => {
  const { versions } = await fetchRegistry<Packument>(pkg);
  return getLatestVersionForPrefix(Object.keys(versions), prefix);
};
