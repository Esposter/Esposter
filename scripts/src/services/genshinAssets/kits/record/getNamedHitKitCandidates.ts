import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { kitParameterSchema } from "genshin-world";

const NAMED_HIT_MULTIPLIER_REGEX = /^(?<hitPath>hits\.[^.]+\.\d+)\.multiplier$/u;

// The candidates a named list's hits take from the talent variable their multiplier joins to: each `hits.<name>.<index>`
// Whose multiplier names a proud skill group and index gcsim's talent variables give a hit for, takes that hit's fields
export const getNamedHitKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  namedHitCandidateMap: NamedHitCandidateMap,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  for (const [path, value] of valueMap) {
    const hitPath = NAMED_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath === undefined || typeof parameter !== "object") continue;
    const fieldMap = namedHitCandidateMap.get(`${parameter.proudSkillGroupId}|${parameter.index}`);
    for (const [field, candidates] of fieldMap ?? []) candidateMap.set(`${hitPath}.${field}`, candidates);
  }
  return candidateMap;
};
