import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { FixtureReferenceStatus } from "#src/models/genshinParity/fixtures/FixtureReferenceStatus";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";

// One fixture screen or variant as a row, with the reference that names it: the first entry whose screen and variant it
// Matches, its status, and its last score and bar. A reference with no approval of its own is judged against the default bar
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
  const reference = Object.entries(referenceMap).find(
    ([, entry]) => entry.screen === name && (entry.variant ?? "") === variant,
  );
  const [referenceId = "", entry] = reference ?? [];
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
