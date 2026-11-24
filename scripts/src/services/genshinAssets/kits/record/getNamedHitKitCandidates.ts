import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { NamedHitCandidate } from "#src/models/genshinAssets/kits/NamedHitCandidate";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { checkIsLandingOrdered } from "#src/services/genshinAssets/kits/gcsim/checkIsLandingOrdered";
import { readNamedHitKey } from "#src/services/genshinAssets/kits/readNamedHitKey";
import { readListHitCalls } from "#src/services/genshinAssets/kits/record/readListHitCalls";
import { readSiteCallsMap } from "#src/services/genshinAssets/kits/record/readSiteCallsMap";
import { splitHitPath } from "#src/services/genshinAssets/kits/record/splitHitPath";
import { kitParameterSchema } from "genshin-world/definitions";

// A hit takes its candidates from the talent variable its multiplier joins to: each hit of a
// `hits` list, a skill hold or a stance hold, or a single hit's own in
// `hitFields`, whose multiplier names a proud skill group and index. Gcsim's talent variables give a hit its fields.
// A hit of a list takes the calls its attack makes in turn, in the order they land.
// Where the list is as long as those calls, its hits take them in that order.
// Calls of several keys from one attack site are merged in the order they land.
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
    const key = readNamedHitKey(parameter);
    const namedHit = namedHitCandidateMap.get(key);
    if (namedHit !== undefined)
      groupHitsMap.set(group, [...(groupHitsMap.get(group) ?? []), { hitPath, index, key, namedHit }]);
  }
  for (const [group, hits] of groupHitsMap) {
    const listLength = listLengthMap.get(group) ?? 0;
    const [firstHit] = hits;
    // A named list of indexed hits whose hits all join one key is as long as the calls that key makes.
    // A loop of one call makes them, though the source may name only some of its hits' multipliers.
    // A hit with no index is a hit of its own, not a list.
    const isOneKeyList =
      group.startsWith("hits.") &&
      firstHit !== undefined &&
      hits.length === listLength &&
      hits.every(({ hitPath, key }) => hitPath !== group && key === firstHit.key);
    const lengthCalls = firstHit === undefined || !isOneKeyList ? undefined : firstHit.namedHit.queuedCalls;
    // Calls whose delays land in order give each hit its own call, so they give the list its length, else the list's
    // Own
    const callsLength =
      lengthCalls !== undefined && checkIsLandingOrdered(lengthCalls) ? lengthCalls.length : listLength;
    const siteCallsMap = readSiteCallsMap(new Map(hits.map(({ key, namedHit }) => [key, namedHit])));
    for (const { hitPath, index, key, namedHit } of hits) {
      for (const [field, candidates] of namedHit.fieldMap) candidateMap.set(`${hitPath}.${field}`, candidates);
      const hitmark = valueMap.get(`${hitPath}.hitmarkFrames`);
      for (const [field, candidates] of readListHitCalls(key, namedHit, index, callsLength, siteCallsMap, hitmark) ??
        [])
        candidateMap.set(`${hitPath}.${field}`, candidates);
    }
    const lengthCall = lengthCalls?.[0];
    if (lengthCall !== undefined && lengthCalls?.length === callsLength)
      addKitCandidate(candidateMap, `${group}.length`, {
        provenance: { file: lengthCall.file, line: lengthCall.line, source: KitSource.Gcsim },
        value: callsLength,
      });
  }
  return candidateMap;
};
