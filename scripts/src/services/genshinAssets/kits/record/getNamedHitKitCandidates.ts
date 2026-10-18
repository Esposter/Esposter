import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type {
  NamedHitCall,
  NamedHitCandidate,
  NamedHitCandidateMap,
} from "#src/models/genshinAssets/kits/NamedHitCandidateMap";

import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
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
// Site whose merged calls do not land in a known, strict order, a delay missing or two calls at one delay, has no order
// To merge by, so it is left out
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
      {
        calls: calls.toSorted(
          (left, right) => (left.delay ?? Number.MAX_SAFE_INTEGER) - (right.delay ?? Number.MAX_SAFE_INTEGER),
        ),
        keys,
      },
    ]),
  );
};

// The calls a list's hit takes by its place: its own key's calls where they are as many as the list is long, else the
// Calls of the one attack site that makes as many calls as the list is long from keys including its own
const readListHitCalls = (
  key: string,
  namedHit: NamedHitCandidate,
  index: number,
  listLength: number,
  siteCallsMap: ReturnType<typeof readSiteCallsMap>,
): Map<string, KitCandidate[]> | undefined => {
  if (namedHit.queuedCalls.length === listLength) return namedHit.queuedCalls[index]?.fieldMap;
  const takingSites = Array.from(siteCallsMap.values()).filter(
    ({ calls, keys }) => calls.length === listLength && keys.has(key) && checkIsLandingOrdered(calls),
  );
  return takingSites.length === 1 ? takingSites[0]?.calls[index]?.fieldMap : undefined;
};

// The candidates a hit takes from the talent variable its multiplier joins to: each hit of a `hits` list, a skill hold's
// Or a stance's, whose multiplier names a proud skill group and index gcsim's talent variables give a hit for, takes that
// Hit's fields. A hit of a list takes the calls its attack makes in turn, in the order they land, where the list is as
// Long as those calls, or where the calls of several keys from one attack site are, merged in the order they land
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
      for (const [field, candidates] of readListHitCalls(key, namedHit, index, listLength, siteCallsMap) ?? [])
        candidateMap.set(`${hitPath}.${field}`, candidates);
    }
  }
  return candidateMap;
};
