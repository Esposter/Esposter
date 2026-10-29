import type { ResolvedKitValues } from "#src/models/genshinAssets/kits/build/ResolvedKitValues";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitOverlayChoice } from "#src/models/genshinAssets/kits/record/KitOverlayChoice";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { getNamedListKitCandidates } from "#src/services/genshinAssets/kits/candidates/getNamedListKitCandidates";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { mergeKitCandidateSources } from "#src/services/genshinAssets/kits/candidates/mergeKitCandidateSources";
import { checkIsCitedBy } from "#src/services/genshinAssets/kits/record/checkIsCitedBy";
import { checkIsKitValueEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueEqual";
import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";
import { getNamedHitKitCandidates } from "#src/services/genshinAssets/kits/record/getNamedHitKitCandidates";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The causes saying no source gives a value: none, no poise, and no damage
const NO_SOURCE_CAUSES: ReadonlySet<KitProvisionalCause> = new Set([
  KitProvisionalCause.NoDamageHit,
  KitProvisionalCause.NoPoiseSource,
  KitProvisionalCause.Unsourced,
]);

const refuseChoice = (path: string, entry: KitOverlayChoice) =>
  new InvalidOperationError(Operation.Read, path, `has no ${entry.source} value for the overlay to choose`);

// A kit's values from its sources' candidates and its overlay: each path takes its first source's value, the overlay
// Then sets its own values, removes others and picks another source where it names one. A talent whose hits a named list
// Spawns keeps its own list empty, the named lists' hits join to their multipliers' talent variables, and the rules fill
// What is still missing over the actions and hits that leaves
export const resolveKitValues = (
  sourceCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  overlay: KitOverlay,
  donorCandidateMap: ReadonlyMap<string, KitCandidate[]>,
  namedHitCandidateMap: NamedHitCandidateMap,
  tables: KitTables,
  isGcsimModelled: boolean,
): ResolvedKitValues => {
  const valueMap = new Map<string, unknown>();
  const provenanceMap = new Map<string, KitValueSource>();
  const choose = (path: string, { provenance, value }: KitCandidate) => {
    valueMap.set(path, value);
    provenanceMap.set(path, provenance);
  };
  const chooseDefaults = (
    candidateMap: ReadonlyMap<string, KitCandidate[]>,
    checkIsSkipped = (path: string) => valueMap.has(path),
  ) => {
    for (const [path, [candidate]] of candidateMap)
      if (candidate !== undefined && !checkIsSkipped(path)) choose(path, candidate);
  };
  // A choice takes the candidate of the source it names, with the value it carries and from the line it cites
  const chooseCandidate = (
    path: string,
    entry: KitOverlayChoice,
    candidates: readonly KitCandidate[] | undefined,
  ): boolean => {
    const candidate = candidates?.find(
      ({ provenance, value }) =>
        provenance.source === entry.source &&
        (entry.value === undefined || checkIsKitValueResolvedEqual(value, entry.value, tables.talentMultiplierMap)) &&
        (!("file" in entry || "page" in entry) || checkIsCitedBy(provenance, entry)),
    );
    if (candidate !== undefined) choose(path, candidate);
    return candidate !== undefined;
  };
  // A choice carrying a value its path's sources do not give is the named-hit join's, which reads the hit's multiplier
  // And the hitmark picking its call from the record, so it holds its value until the join runs and then takes its candidate
  const joinedChoiceMap = new Map<string, KitOverlayChoice>();
  for (const [path, entry] of Object.entries(overlay))
    if ("source" in entry) {
      if (chooseCandidate(path, entry, sourceCandidateMap.get(path))) continue;
      if (entry.value === undefined) throw refuseChoice(path, entry);
      valueMap.set(path, entry.value);
      joinedChoiceMap.set(path, entry);
    } else if (entry.donor === undefined) {
      // A cause saying gcsim has no folder for the character is refused where it has one, which can read the value
      if (entry.cause === KitProvisionalCause.NoGcsimUnit && isGcsimModelled)
        throw new InvalidOperationError(
          Operation.Read,
          path,
          "names NoGcsimUnit, but gcsim has a folder for the character",
        );
      valueMap.set(path, entry.value);
      provenanceMap.set(path, { cause: entry.cause, source: KitSource.Overlay });
    } else {
      // A borrowed value takes the candidate its donor's record gives at the path the entry names
      const candidate = donorCandidateMap.get(path)?.[0];
      if (candidate === undefined)
        throw new InvalidOperationError(Operation.Read, path, "has no donor value to borrow");
      choose(path, candidate);
    }
  chooseDefaults(sourceCandidateMap);
  // A named list's hits list is empty, which supersedes gcsim's count of the talent's hits. Its multipliers may come from
  // The tables, so the list is read once the source defaults are in, and it takes over what they chose for paths the
  // Overlay does not set
  const namedListKitCandidateMap = getNamedListKitCandidates(valueMap, tables.talentGroupIdMap);
  chooseDefaults(namedListKitCandidateMap, (path) => Object.hasOwn(overlay, path));
  const namedHitKitCandidateMap = getNamedHitKitCandidates(valueMap, namedHitCandidateMap);
  for (const [path, entry] of joinedChoiceMap)
    if (!chooseCandidate(path, entry, namedHitKitCandidateMap.get(path))) throw refuseChoice(path, entry);
  // A cause saying no source gives the value is refused where one does, and a value said to differ from its sources is
  // Refused where one gives that very value, as a choice of that source names it. A reference equal to another only in
  // The numbers it reads is a different value, as its talent's level is the one it plays at
  for (const [path, entry] of Object.entries(overlay)) {
    if (!("cause" in entry)) continue;
    const sourceCandidates = [
      ...(sourceCandidateMap.get(path) ?? []),
      ...(namedHitKitCandidateMap.get(path) ?? []),
    ].filter(({ provenance }) => provenance.source !== KitSource.Rule);
    const candidate = NO_SOURCE_CAUSES.has(entry.cause)
      ? sourceCandidates[0]
      : entry.cause === KitProvisionalCause.DiffersFromSource && entry.value !== undefined
        ? sourceCandidates.find(({ value }) => checkIsKitValueEqual(value, entry.value))
        : undefined;
    if (candidate !== undefined)
      throw new InvalidOperationError(
        Operation.Read,
        path,
        `names ${entry.cause}, but ${candidate.provenance.source} gives ${JSON.stringify(candidate.value)}`,
      );
  }
  chooseDefaults(namedHitKitCandidateMap);
  const ruleCandidateMap = getRuleKitCandidates(valueMap, tables.element);
  chooseDefaults(ruleCandidateMap);
  return {
    candidateMap: mergeKitCandidateSources({
      namedHitCandidateMap: namedHitKitCandidateMap,
      namedListCandidateMap: namedListKitCandidateMap,
      ruleCandidateMap,
      sourceCandidateMap,
    }),
    provenanceMap,
    valueMap,
  };
};
