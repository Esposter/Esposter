import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { CombatTalent, kitParameterSchema } from "genshin-world";

const NAMED_HIT_MULTIPLIER_REGEX = /^hits\.[^.]+\.\d+\.multiplier$/u;

// The slot each combat talent with one of its own holds its hits list in, which a named list of its hits leaves empty
const TALENT_SLOTS: [CombatTalent, string][] = [
  [CombatTalent.ElementalBurst, "burst"],
  [CombatTalent.ElementalSkill, "skill"],
];

// The hits lists a named list's hits join to by their multipliers' proud skill group are empty, as the module spawns the
// Hits as a list of its own. It supersedes gcsim's count of the talent's hits, so it is the first candidate for its path
export const getNamedListKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const namedGroupIds = new Set<number>();
  for (const [path, value] of valueMap) {
    const parameter = kitParameterSchema.safeParse(value).data;
    if (NAMED_HIT_MULTIPLIER_REGEX.test(path) && typeof parameter === "object")
      namedGroupIds.add(parameter.proudSkillGroupId);
  }
  for (const [combatTalent, slot] of TALENT_SLOTS) {
    if (!namedGroupIds.has(talentGroupIdMap[combatTalent])) continue;
    addKitCandidate(candidateMap, `${slot}.hits.length`, {
      provenance: { cause: KitProvisionalCause.NamedHitList, rule: KitRule.NamedHitList, source: KitSource.Rule },
      value: 0,
    });
  }
  return candidateMap;
};
