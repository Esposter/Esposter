import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { FixtureReferenceStatus } from "#src/models/genshinParity/fixtures/FixtureReferenceStatus";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { getPrimaryReferenceId } from "#src/services/genshinParity/reference/getPrimaryReferenceId";
import { getVariantEntries } from "#src/services/genshinParity/reference/getVariantEntries";

// One fixture screen or variant as a row, with the reference that names it: its primary reference (`getPrimaryReferenceId`),
// its status, and its last score and bar. A reference with no approval of its own is judged against the default bar
export const getFixtureScreenRow = ({
  directory,
  imageExists,
  name,
  referenceMap,
  reportMeans,
  variant,
}: {
  directory: string;
  imageExists: boolean;
  name: string;
  referenceMap: Record<string, ParityReference>;
  reportMeans: ReadonlyMap<string, number>;
  variant: string;
}): FixtureScreenRow => {
  const referenceId = getPrimaryReferenceId(getVariantEntries(referenceMap, name, variant)) ?? "";
  const entry = referenceMap[referenceId];
  let referenceStatus = FixtureReferenceStatus.None;
  if (entry?.pending !== undefined) referenceStatus = FixtureReferenceStatus.Pending;
  else if (entry) referenceStatus = FixtureReferenceStatus.Entry;
  return {
    bar: entry ? (entry.approval ?? DEFAULT_APPROVAL).bar : null,
    directory,
    imageExists,
    lastScore: reportMeans.get(referenceId) ?? null,
    name,
    referenceId,
    referenceStatus,
    variant,
  };
};
