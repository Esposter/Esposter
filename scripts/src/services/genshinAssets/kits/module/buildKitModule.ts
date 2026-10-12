import type { KitModule } from "#src/models/genshinAssets/kits/module/KitModule";
import type { KitModuleBuild } from "#src/models/genshinAssets/kits/module/KitModuleBuild";
import type { TalentMultiplierMap } from "genshin-world";

import { getOrCreate, getResult } from "@esposter/shared";

// A probed kit module built from one map of multipliers, with every site's values in the order its spans were
// Evaluated, from the spans evaluated as it loaded on. A thunk is read once the kit is built, so a site whose scope
// Moved on since fails, and is named
export const buildKitModule = (
  { createKit, loadProbeEntryCount, probeEntries }: KitModule,
  talentMultiplierMap: TalentMultiplierMap,
): KitModuleBuild => {
  probeEntries.length = loadProbeEntryCount;
  const kit = createKit(talentMultiplierMap);
  const siteValueMap = new Map<string, unknown[]>();
  const failedSiteIds: string[] = [];
  for (const [siteId, thunk] of probeEntries)
    getResult(thunk).match(
      (value) => {
        getOrCreate(siteValueMap, siteId, () => []).push(value);
      },
      () => {
        failedSiteIds.push(siteId);
      },
    );
  return { failedSiteIds, kit, siteValueMap };
};
