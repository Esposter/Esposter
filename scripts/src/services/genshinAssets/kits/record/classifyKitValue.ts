import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlayEntry } from "#src/models/genshinAssets/kits/KitOverlayEntry";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { checkIsKitValueResolvedEqual } from "#src/services/genshinAssets/kits/record/checkIsKitValueResolvedEqual";

const SELECTABLE_SOURCES = [KitSource.Gcsim, KitSource.Tables, KitSource.Wiki] as const;

const findSourceCandidate = (candidates: readonly KitCandidate[], source: KitSource): KitCandidate | undefined =>
  candidates.find(({ provenance }) => provenance.source === source);

// The overlay entry a module's value needs for one path, none where the path's default already is it. A value gcsim's
// Current branch gives and its tag does not was read past the licence line, unless the tag predates the character,
// When it is unclassified. Otherwise a value another source gives is that source chosen, a value every source
// Disagrees with differs from them, and a value no source gives is unclassified.
export const classifyKitValue = (
  value: unknown,
  candidates: readonly KitCandidate[],
  mainCandidates: readonly KitCandidate[],
  isTagPredated: boolean,
  talentMultiplierMap: KitTables["talentMultiplierMap"],
): KitOverlayEntry | undefined => {
  const isEqual = (candidateValue: unknown) => checkIsKitValueResolvedEqual(candidateValue, value, talentMultiplierMap);
  if (candidates.length > 0 && isEqual(candidates[0]?.value)) return undefined;
  const withValue = (cause: KitProvisionalCause): KitOverlayEntry => ({ cause, value });
  const tagCandidate = findSourceCandidate(candidates, KitSource.Gcsim);
  const mainCandidate = findSourceCandidate(mainCandidates, KitSource.Gcsim);
  if (
    mainCandidate !== undefined &&
    isEqual(mainCandidate.value) &&
    (tagCandidate === undefined || !isEqual(tagCandidate.value))
  )
    return withValue(isTagPredated ? KitProvisionalCause.Unclassified : KitProvisionalCause.ReadPastLicence);
  for (const source of SELECTABLE_SOURCES) {
    const candidate = findSourceCandidate(candidates, source);
    if (candidate !== undefined && isEqual(candidate.value)) return { source };
  }
  return withValue(
    candidates.some(({ provenance }) => provenance.source !== KitSource.Rule)
      ? KitProvisionalCause.DiffersFromSource
      : KitProvisionalCause.Unclassified,
  );
};
