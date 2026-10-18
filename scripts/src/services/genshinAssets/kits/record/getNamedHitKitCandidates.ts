import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate, NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { readListHitCalls } from "#src/services/genshinAssets/kits/record/readListHitCalls";
import { readSiteCallsMap } from "#src/services/genshinAssets/kits/record/readSiteCallsMap";
import { splitHitPath } from "#src/services/genshinAssets/kits/record/splitHitPath";
import { kitParameterSchema } from "genshin-world";

// The candidates a hit takes from the talent variable its multiplier joins to: each hit of a `hits` list, a skill hold's
// Or a stance's, or a single hit's own in `hitFields`, whose multiplier names a proud skill group and index gcsim's talent
// Variables give a hit for, takes that hit's fields. A hit of a list takes the calls its attack makes in turn, in the
// Order they land, where the list is as long as those calls, or where the calls of several keys from one attack site are,
// Merged in the order they land
export const getNamedHitKitCandidates = (
  valueMap: ReadonlyMap<string, unknown>,
  namedHitCandidateMap: NamedHitCandidateMap,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const listLengthMap = new Map<string, number>();
  const groupHitsMap = new Map<
    string,
    { hitPath: string; index: number; key: string; namedHit: NamedHitCandidate }[]
  >();
  for (const [path, value] of valueMap) {
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (hitPath === undefined || typeof parameter !== "object") continue;
    const { group, index } = splitHitPath(hitPath);
    listLengthMap.set(group, (listLengthMap.get(group) ?? 0) + 1);
    const key = `${parameter.proudSkillGroupId}|${parameter.index}`;
    const namedHit = namedHitCandidateMap.get(key);
    if (namedHit !== undefined)
      groupHitsMap.set(group, [...(groupHitsMap.get(group) ?? []), { hitPath, index, key, namedHit }]);
  }
  for (const [group, hits] of groupHitsMap) {
    const listLength = listLengthMap.get(group) ?? 0;
    const siteCallsMap = readSiteCallsMap(new Map(hits.map(({ key, namedHit }) => [key, namedHit])));
    for (const { hitPath, index, key, namedHit } of hits) {
      for (const [field, candidates] of namedHit.fieldMap) candidateMap.set(`${hitPath}.${field}`, candidates);
      const hitmark = valueMap.get(`${hitPath}.hitmarkFrames`);
      for (const [field, candidates] of readListHitCalls(key, namedHit, index, listLength, siteCallsMap, hitmark) ?? [])
        candidateMap.set(`${hitPath}.${field}`, candidates);
    }
    // A named list of indexed hits whose hits all join one key takes its length from the calls that key makes, where they
    // Are as many as its hits, as a loop of one call makes them. A hit with no index is a hit of its own, not a list
    const [firstHit] = hits;
    const lengthCall = firstHit?.namedHit.queuedCalls[0];
    if (
      group.startsWith("hits.") &&
      firstHit !== undefined &&
      lengthCall !== undefined &&
      hits.length === listLength &&
      hits.every(({ hitPath, key }) => hitPath !== group && key === firstHit.key) &&
      firstHit.namedHit.queuedCalls.length === listLength
    )
      addKitCandidate(candidateMap, `${group}.length`, {
        provenance: { file: lengthCall.file, line: lengthCall.line, source: KitSource.Gcsim },
        value: listLength,
      });
  }
  return candidateMap;
};
