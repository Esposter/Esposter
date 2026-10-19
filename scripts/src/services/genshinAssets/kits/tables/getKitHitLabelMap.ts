import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitHitLabel } from "#src/models/genshinAssets/kits/tables/KitHitLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { kitParameterSchema } from "genshin-world";

// A slot hit is the skill's or burst's, a stance's, a hold's, or a named hit's, whose multiplier names its table label
const SLOT_HIT_MULTIPLIER_PATH_REGEX =
  /^(?<hitPath>(?:skill|burst)\.hits\.\d+|stances\.[A-Za-z]+\.(?:chargedAttack|skill|normalAttacks\.\d+)\.hits\.\d+|skillHolds\.\d+\.(?:action|variant)\.hits\.\d+|hits\.[A-Za-z]+(?:\.\d+)?)\.multiplier$/u;

// The table label each slot hit deals its multiplier under, by the hit's path, with the proud skill group that label belongs
// To. A hit takes the label its first candidate's parameter names: the burst's first hit `1-Hit Swing DMG` where it reads that
// Label's parameter. A hold's or a named hit's multiplier no candidate gives is labelled by its overlay's, as gcsim gives most
// Of them none
export const getKitHitLabelMap = (
  candidateMap: ReadonlyMap<string, KitCandidate[]>,
  { labelMap }: Pick<KitTables, "labelMap">,
  overlay: KitOverlay,
): Map<string, KitHitLabel> => {
  const hitLabelMap = new Map<string, KitHitLabel>();
  const multiplierPaths = new Set([...candidateMap.keys(), ...Object.keys(overlay)]);
  for (const path of multiplierPaths) {
    const hitPath = SLOT_HIT_MULTIPLIER_PATH_REGEX.exec(path)?.groups?.hitPath;
    // A skill's or burst's hit keeps its gcsim candidate's label alone; a hold or a named hit takes its overlay's multiplier
    // Where no candidate gives one
    const isOverlayLabelled = hitPath?.startsWith("skillHolds.") || hitPath?.startsWith("hits.");
    const value = candidateMap.get(path)?.[0]?.value ?? (isOverlayLabelled ? overlay[path]?.value : undefined);
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath === undefined || parameter === undefined || typeof parameter === "number") continue;
    const tableLabel = labelMap
      .get(parameter.proudSkillGroupId)
      ?.find(({ indexes }) => indexes.includes(parameter.index));
    if (tableLabel !== undefined)
      hitLabelMap.set(hitPath, { label: tableLabel.label, proudSkillGroupId: parameter.proudSkillGroupId });
  }
  return hitLabelMap;
};
