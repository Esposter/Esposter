import type { KitModule } from "#src/models/genshinAssets/kits/module/KitModule";
import type { KitModuleAnalysis } from "#src/models/genshinAssets/kits/module/KitModuleAnalysis";
import type { KitProbeEntry } from "#src/models/genshinAssets/kits/module/KitProbeEntry";
import type { Kit, TalentMultiplierMap } from "genshin-world";

import { KIT_PROBE_ENTRIES_NAME, KIT_PROBE_QUERY } from "#src/services/genshinAssets/kits/constants";
import { instrumentKitModule } from "#src/services/genshinAssets/kits/module/instrumentKitModule";
import { withFinalizerAsync } from "@esposter/shared";
import { TRAVELER_CHARACTER_ID } from "genshin-world";
import { realpathSync } from "node:fs";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

// A kit module loaded with its sites probed, from its instrumented text served under a URL of its own while it is
// Imported, its own imports loading as they always do. The Traveler's module exports no id, as every element of hers
// Shares one
export const loadKitModule = async (analysis: KitModuleAnalysis): Promise<KitModule> => {
  const url = `${pathToFileURL(realpathSync(analysis.file)).href}${KIT_PROBE_QUERY}`;
  const source = instrumentKitModule(analysis);
  const hooks = registerHooks({
    load: (loadUrl, context, nextLoad) =>
      loadUrl === url ? { format: "module", shortCircuit: true, source } : nextLoad(loadUrl, context),
  });
  const module = (await withFinalizerAsync(
    () => import(url),
    () => {
      hooks.deregister();
    },
  )) as Record<string, unknown>;
  const probeEntries = module[KIT_PROBE_ENTRIES_NAME] as KitProbeEntry[];
  return {
    analysis,
    characterId:
      analysis.characterIdName === undefined ? TRAVELER_CHARACTER_ID : (module[analysis.characterIdName] as number),
    createKit: module[analysis.createName] as (talentMultiplierMap: TalentMultiplierMap) => Kit,
    loadProbeEntryCount: probeEntries.length,
    probeEntries,
  };
};
