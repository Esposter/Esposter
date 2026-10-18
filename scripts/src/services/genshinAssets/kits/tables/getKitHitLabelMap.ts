import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { kitParameterSchema } from "genshin-world";

// A slot hit is the skill's or burst's, a stance's, or a hold's, whose multiplier names its table label
const SLOT_HIT_MULTIPLIER_PATH_REGEX =
  /^(?<hitPath>(?:skill|burst)\.hits\.\d+|stances\.[A-Za-z]+\.(?:chargedAttack|skill|normalAttacks\.\d+)\.hits\.\d+|skillHolds\.\d+\.(?:action|variant)\.hits\.\d+)\.multiplier$/u;

// The table label each of the skill's, burst's, stances' and skill holds' hits deals its multiplier under, by the hit's path, as its
// First candidate's parameter names it: the burst's first hit `1-Hit Swing DMG` where it reads that label's parameter. A
// Multiplier no candidate gives is labelled by the overlay's, as a hold gcsim gives none for is joined to its row by it
export const getKitHitLabelMap = (
  candidateMap: ReadonlyMap<string, KitCandidate[]>,
  { labelMap }: Pick<KitTables, "labelMap">,
  overlay: KitOverlay,
): Map<string, string> => {
  const hitLabelMap = new Map<string, string>();
  const multiplierPaths = new Set([...candidateMap.keys(), ...Object.keys(overlay)]);
  for (const path of multiplierPaths) {
    const hitPath = SLOT_HIT_MULTIPLIER_PATH_REGEX.exec(path)?.groups?.hitPath;
    // A skill's or burst's hit keeps its gcsim candidate's label alone; only a hold has its overlay's multiplier as its label
    const value =
      candidateMap.get(path)?.[0]?.value ?? (hitPath?.startsWith("skillHolds.") ? overlay[path]?.value : undefined);
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath === undefined || parameter === undefined || typeof parameter === "number") continue;
    const tableLabel = labelMap
      .get(parameter.proudSkillGroupId)
      ?.find(({ indexes }) => indexes.includes(parameter.index));
    if (tableLabel !== undefined) hitLabelMap.set(hitPath, tableLabel.label);
  }
  return hitLabelMap;
};
