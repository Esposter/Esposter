import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { kitParameterSchema } from "genshin-world";

const HIT_MULTIPLIER_REGEX = /^(?<hitPath>(?:.+\.)?hits\.(?:\d+|[^.]+(?:\.\d+)?))\.multiplier$/u;

// The candidates a hit takes from the talent variable its multiplier joins to: each hit of a `hits` list, a skill hold's or
// A stance's, whose multiplier names a proud skill group and index gcsim's talent variables give a hit for, takes that hit's fields
export const getNamedHitKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  namedHitCandidateMap: NamedHitCandidateMap,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, value] of valueMap) {
    const hitPath = HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath === undefined || typeof parameter !== "object") continue;
    const fieldMap = namedHitCandidateMap.get(`${parameter.proudSkillGroupId}|${parameter.index}`);
    for (const [field, candidates] of fieldMap ?? []) candidateMap.set(`${hitPath}.${field}`, candidates);
  }
  return candidateMap;
};
