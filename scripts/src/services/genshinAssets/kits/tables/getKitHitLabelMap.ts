import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/shared/KitOverlay";
import type { KitHitLabel } from "#src/models/genshinAssets/kits/tables/KitHitLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { checkIsTitleSlotPath } from "#src/services/genshinAssets/kits/wiki/checkIsTitleSlotPath";
import { kitParameterSchema } from "genshin-world";

// A hit's path split into its list and its index, `burst.hits` and `5` for `burst.hits.5`
const HIT_LIST_INDEX_REGEX = /^(?<list>.+)\.(?<index>\d+)$/u;

// The table label each hit deals its multiplier under, by the hit's path, with the proud skill group that label
// Belongs to. A hit takes the label of the multiplier the record publishes at its path, the overlay's where it sets a
// Value and else its first candidate's. A hit at or past its list's length takes none: the overlay's length, else the
// Named list rule's empty list, which the resolver gives the slot a named list joins to
export const getKitHitLabelMap = (
  candidateMap: ReadonlyMap<string, KitCandidate[]>,
  { labelMap, talentGroupIdMap }: Pick<KitTables, "labelMap" | "talentGroupIdMap">,
  overlay: KitOverlay,
): Map<string, KitHitLabel> => {
  const multiplierMap = new Map<string, unknown>();
  for (const path of new Set([...candidateMap.keys(), ...Object.keys(overlay)]))
    if (KIT_HIT_MULTIPLIER_REGEX.test(path))
      multiplierMap.set(path, overlay[path]?.value ?? candidateMap.get(path)?.[0]?.value);
  const namedListCandidateMap = getNamedListKitCandidates(multiplierMap, talentGroupIdMap);
  const hitLabelMap = new Map<string, KitHitLabel>();
  for (const [path, value] of multiplierMap) {
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    // Every hit takes its label but the normal attack page's strikes, charged attack, plunges and collision, which take
    // Their rows by their titles
    if (hitPath === undefined || checkIsTitleSlotPath(hitPath)) continue;
    const listIndex = HIT_LIST_INDEX_REGEX.exec(hitPath)?.groups;
    if (listIndex !== undefined) {
      const lengthPath = `${listIndex.list}.length`;
      const length = overlay[lengthPath]?.value ?? namedListCandidateMap.get(lengthPath)?.[0]?.value;
      if (typeof length === "number" && Number(listIndex.index) >= length) continue;
    }
    const parameter = kitParameterSchema.safeParse(value).data;
    if (parameter === undefined || typeof parameter === "number") continue;
    const tableLabel = labelMap
      .get(parameter.proudSkillGroupId)
      ?.find(({ indexes }) => indexes.includes(parameter.index));
    if (tableLabel !== undefined)
      hitLabelMap.set(hitPath, { label: tableLabel.label, proudSkillGroupId: parameter.proudSkillGroupId });
  }
  return hitLabelMap;
};
