import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { checkHasOwnSlotHit } from "#src/services/genshinAssets/kits/candidates/checkHasOwnSlotHit";
import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { CombatTalent, kitParameterSchema } from "genshin-world";

// A named list's hit path, `hits.<name>.<index>`: a list a module spawns of its own, with no prefix. A slot's list,
// `burst.hits.<index>`, or a skill hold's, `skillHolds.0.hits.<index>`, is not one
const NAMED_HIT_PATH_REGEX = /^hits\.[^.]+\.\d+$/u;
// A stance's action, `stances.<name>.skill` or `stances.<name>.normalAttacks.<index>`, which its hits list sits in
const STANCE_ACTION_PATH_REGEX = /^(?<slot>stances\.[^.]+\.(?:burst|chargedAttack|skill|normalAttacks\.\d+))\./u;
// The slot each combat talent with one of its own holds its hits list in, which a named list of its hits leaves empty
const TALENT_SLOTS: [CombatTalent, string][] = [
  [CombatTalent.ElementalBurst, "burst"],
  [CombatTalent.ElementalSkill, "skill"],
];

// The hits lists a named list's hits join to by their multipliers' proud skill group are empty, as the module spawns the
// Hits as a list of its own, unless a hit of the slot's own joins that group at an index no named list's hit does. It
// Supersedes gcsim's count of the talent's hits, so it is the first candidate for its path
export const getNamedListKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  talentGroupIdMap: KitTables["talentGroupIdMap"],
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const namedGroupIds = new Set<number>();
  const namedParameters = new Set<string>();
  for (const [path, value] of valueMap) {
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath !== undefined && NAMED_HIT_PATH_REGEX.test(hitPath) && typeof parameter === "object") {
      namedGroupIds.add(parameter.proudSkillGroupId);
      namedParameters.add(`${parameter.proudSkillGroupId}.${parameter.index}`);
    }
  }
  // A stance's actions are entered through the elemental skill, and the named lists they spawn sit in its group too, as
  // Swift Hunt's and Impale the Night's do, so each one takes the skill group's
  const slotGroupIdMap = new Map<string, number>(
    TALENT_SLOTS.map(([combatTalent, slot]) => [slot, talentGroupIdMap[combatTalent]]),
  );
  for (const path of valueMap.keys()) {
    const stanceSlot = STANCE_ACTION_PATH_REGEX.exec(path)?.groups?.slot;
    if (stanceSlot !== undefined) slotGroupIdMap.set(stanceSlot, talentGroupIdMap[CombatTalent.ElementalSkill]);
  }
  for (const [slot, groupId] of slotGroupIdMap) {
    if (!namedGroupIds.has(groupId) || checkHasOwnSlotHit(valueMap, slot, namedParameters)) continue;
    addKitCandidate(candidateMap, `${slot}.hits.length`, {
      provenance: { cause: KitProvisionalCause.NamedHitList, rule: KitRule.NamedHitList, source: KitSource.Rule },
      value: 0,
    });
  }
  return candidateMap;
};
