import type { KitModuleAnalysis } from "#src/models/genshinAssets/kits/module/KitModuleAnalysis";
import type { KitProbeEntry } from "#src/models/genshinAssets/kits/module/KitProbeEntry";
import type { Kit, TalentMultiplierMap } from "genshin-world";

// A kit module loaded with its sites probed: its analysis, its character's id, its create function, the list it adds a
// Thunk to for each site each time a span is evaluated, and how many it added as it loaded
export interface KitModule {
  analysis: KitModuleAnalysis;
  characterId: number;
  createKit: (talentMultiplierMap: TalentMultiplierMap) => Kit;
  loadProbeEntryCount: number;
  probeEntries: KitProbeEntry[];
}
