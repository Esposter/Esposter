import type { Kit } from "genshin-world";

// A kit module built once, from one map of multipliers: the kit, every site's values in the order the probe read them,
// And the sites the probe could not read
export interface KitModuleBuild {
  failedSiteIds: string[];
  kit: Kit;
  siteValueMap: Map<string, unknown[]>;
}
