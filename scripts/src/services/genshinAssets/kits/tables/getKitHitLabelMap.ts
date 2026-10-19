import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitHitLabel } from "#src/models/genshinAssets/kits/tables/KitHitLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { kitParameterSchema } from "genshin-world";

// A slot hit is the skill's or burst's, a stance's, a hold's, or a named hit's, whose multiplier names its table label
const SLOT_HIT_PATH_REGEX =
  /^(?:(?:skill|burst)\.|stances\.[A-Za-z]+\.(?:chargedAttack|skill|normalAttacks\.\d+)\.|skillHolds\.\d+\.(?:action|variant)\.)?hits\.(?:\d+|[A-Za-z]+(?:\.\d+)?)$/u;

// A hit's path split into its list and its index, `burst.hits` and `5` for `burst.hits.5`
const HIT_LIST_INDEX_REGEX = /^(?<list>.+)\.(?<index>\d+)$/u;

// Whether a hit's index is at or past the length its list's overlay sets, so the record holds no hit at that index
const checkPastListLength = (hitPath: string, overlay: KitOverlay): boolean => {
  const listIndex = HIT_LIST_INDEX_REGEX.exec(hitPath)?.groups;
  const length = listIndex === undefined ? undefined : overlay[`${listIndex.list}.length`]?.value;
  return typeof length === "number" && Number(listIndex?.index) >= length;
};

// The table label each slot hit deals its multiplier under, by the hit's path, with the proud skill group that label
// Belongs to. A hit takes the label of the multiplier the record publishes at its path, the overlay's where it sets a
// Value and else its first candidate's, and a hit at or past the length its list's overlay sets takes none
export const getKitHitLabelMap = (
  candidateMap: ReadonlyMap<string, KitCandidate[]>,
  { labelMap }: Pick<KitTables, "labelMap">,
  overlay: KitOverlay,
): Map<string, KitHitLabel> => {
  const hitLabelMap = new Map<string, KitHitLabel>();
  const multiplierPaths = new Set([...candidateMap.keys(), ...Object.keys(overlay)]);
  for (const path of multiplierPaths) {
    const multiplierHitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const hitPath =
      multiplierHitPath !== undefined && SLOT_HIT_PATH_REGEX.test(multiplierHitPath) ? multiplierHitPath : undefined;
    if (hitPath === undefined || checkPastListLength(hitPath, overlay)) continue;
    const value = overlay[path]?.value ?? candidateMap.get(path)?.[0]?.value;
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
