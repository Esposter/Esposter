import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { CombatTalent, kitParameterSchema } from "genshin-world";

// A named list's hit path, `hits.<name>.<index>`: a list a module spawns of its own, with no prefix. A slot's list,
// `burst.hits.<index>`, or a skill hold's, `skillHolds.0.hits.<index>`, is not one
const NAMED_HIT_PATH_REGEX = /^hits\.[^.]+\.\d+$/u;

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
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath !== undefined && NAMED_HIT_PATH_REGEX.test(hitPath) && typeof parameter === "object")
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
