import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { kitParameterSchema } from "genshin-world";

const SLOT_HIT_MULTIPLIER_PATH_REGEX = /^(?<hitPath>(?:skill|burst)\.hits\.\d+)\.multiplier$/u;

// The table label each of the skill's and burst's hits deals its multiplier under, by the hit's path, as its first
// Source's parameter names it: the burst's first hit `1-Hit Swing DMG` where it reads that label's parameter
export const getKitHitLabelMap = (
  candidateMap: ReadonlyMap<string, KitCandidate[]>,
  { labelMap }: KitTables,
): Map<string, string> => {
  const hitLabelMap = new Map<string, string>();
  for (const [path, [candidate]] of candidateMap) {
    const hitPath = SLOT_HIT_MULTIPLIER_PATH_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(candidate?.value).data;
    if (hitPath === undefined || parameter === undefined || typeof parameter === "number") continue;
    const tableLabel = labelMap
      .get(parameter.proudSkillGroupId)
      ?.find(({ indexes }) => indexes.includes(parameter.index));
    if (tableLabel !== undefined) hitLabelMap.set(hitPath, tableLabel.label);
  }
  return hitLabelMap;
};
