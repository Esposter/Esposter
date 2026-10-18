import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate, NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { kitParameterSchema } from "genshin-world";

const INDEXED_HIT_REGEX = /^(?<group>.+)\.(?<index>\d+)$/u;

// A hit's list and its place in it: `hits.fatalBlossoms.1` is the second hit of `hits.fatalBlossoms`, and a hit with no
// Place is the first of a list of its own
const splitHitPath = (hitPath: string): { group: string; index: number } => {
  const groups = INDEXED_HIT_REGEX.exec(hitPath)?.groups;
  return groups?.group === undefined
    ? { group: hitPath, index: 0 }
    : { group: groups.group, index: Number(groups.index) };
};

// The candidates a hit takes from the talent variable its multiplier joins to: each hit of a `hits` list, a skill hold's
// Or a stance's, whose multiplier names a proud skill group and index gcsim's talent variables give a hit for, takes that
// Hit's fields. A hit of a list as long as its attack's calls takes each call's hitbox and damage delay in turn
export const getNamedHitKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  namedHitCandidateMap: NamedHitCandidateMap,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const listLengthMap = new Map<string, number>();
  const joinedHits: { group: string; hitPath: string; index: number; namedHit: NamedHitCandidate }[] = [];
  for (const [path, value] of valueMap) {
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath === undefined || typeof parameter !== "object") continue;
    const { group, index } = splitHitPath(hitPath);
    listLengthMap.set(group, (listLengthMap.get(group) ?? 0) + 1);
    const namedHit = namedHitCandidateMap.get(`${parameter.proudSkillGroupId}|${parameter.index}`);
    if (namedHit !== undefined) joinedHits.push({ group, hitPath, index, namedHit });
  }
  for (const { group, hitPath, index, namedHit } of joinedHits) {
    for (const [field, candidates] of namedHit.fieldMap) candidateMap.set(`${hitPath}.${field}`, candidates);
    const isListTaken = namedHit.queuedFieldMaps.length === listLengthMap.get(group);
    for (const [field, candidates] of (isListTaken ? namedHit.queuedFieldMaps[index] : undefined) ?? [])
      candidateMap.set(`${hitPath}.${field}`, candidates);
  }
  return candidateMap;
};
