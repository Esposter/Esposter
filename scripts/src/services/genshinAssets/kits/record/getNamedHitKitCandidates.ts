import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type {
  NamedHitCall,
  NamedHitCandidate,
  NamedHitCandidateMap,
} from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { compareQueuedDelays } from "#src/services/genshinAssets/kits/compareQueuedDelays";
import { checkIsLandingOrdered } from "#src/services/genshinAssets/kits/gcsim/checkIsLandingOrdered";
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

// The calls each attack site makes of a list's joined keys, merged in the order they land, with the keys making them. A
// Delay missing or two calls at one delay leaves no order to merge by, which readListHitCalls checks before taking them
const readSiteCallsMap = (
  namedHits: ReadonlyMap<string, NamedHitCandidate>,
): Map<string, { calls: NamedHitCall[]; keys: Set<string> }> => {
  const siteCallsMap = new Map<string, { calls: NamedHitCall[]; keys: Set<string> }>();
  for (const [key, { queuedCalls }] of namedHits)
    for (const call of queuedCalls) {
      const siteCalls = siteCallsMap.get(call.site) ?? { calls: [], keys: new Set<string>() };
      siteCalls.calls.push(call);
      siteCalls.keys.add(key);
      siteCallsMap.set(call.site, siteCalls);
    }
  return new Map(
    Array.from(siteCallsMap, ([site, { calls, keys }]): [string, { calls: NamedHitCall[]; keys: Set<string> }] => [
      site,
      { calls: calls.toSorted(compareQueuedDelays), keys },
    ]),
  );
};

// The calls a list's hit takes: first the one call of its key that fires at the hit's own hitmark, where the hit has one
// And one call lands there, as a call of another delay the same attack makes is not the list's hit. Else by its place: its
// Own key's calls where they are as many as the list is long, else the calls of the one attack site that makes as many
// Calls as the list is long from keys including its own. A second such site, whether its calls land in an order or not,
// Is a rival the hit cannot tell apart from, so neither is taken
const readListHitCalls = (
  key: string,
  namedHit: NamedHitCandidate,
  index: number,
  listLength: number,
  siteCallsMap: ReturnType<typeof readSiteCallsMap>,
  hitmark: unknown,
): Map<string, KitCandidate[]> | undefined => {
  const hitmarkCalls = typeof hitmark === "number" ? namedHit.queuedCalls.filter(({ delay }) => delay === hitmark) : [];
  if (hitmarkCalls.length === 1) return hitmarkCalls[0]?.fieldMap;
  if (namedHit.queuedCalls.length === listLength) return namedHit.queuedCalls[index]?.fieldMap;
  const takingSites = [...siteCallsMap.values()].filter(
    ({ calls, keys }) => calls.length === listLength && keys.has(key),
  );
  const takingSite = takingSites.length === 1 ? takingSites[0] : undefined;
  return takingSite !== undefined && checkIsLandingOrdered(takingSite.calls)
    ? takingSite.calls[index]?.fieldMap
    : undefined;
};

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
