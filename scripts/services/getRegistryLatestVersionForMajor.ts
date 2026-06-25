import type { Packument } from "@/services/models/Packument";

import { fetchRegistry } from "@/services/fetchRegistry";
import { getLatestVersionForMajor } from "@/services/getLatestVersionForMajor";
/** Fetch `pkg` from the npm registry and return its highest published version matching `major`. */
export const getRegistryLatestVersionForMajor = async (pkg: string, major: number): Promise<string> => {
  const { versions } = await fetchRegistry<Packument>(pkg);
  return getLatestVersionForMajor(Object.keys(versions), major);
};
