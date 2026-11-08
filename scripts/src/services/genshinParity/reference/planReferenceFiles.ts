import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { getPrimaryReferenceId } from "#src/services/genshinParity/reference/getPrimaryReferenceId";
import { getVariantEntries } from "#src/services/genshinParity/reference/getVariantEntries";
import { getFixtureReferenceFilePath } from "#src/services/genshinParity/shared/getFixtureReferenceFilePath";
import { getFlatReferenceFilePath } from "#src/services/genshinParity/shared/getFlatReferenceFilePath";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join, relative } from "node:path";

const toRepositoryPath = (path: string): string => relative(REPOSITORY_ROOT, path).replaceAll("\\", "/");

// Where each reference the map names is committed.
// Each fixture variant with a reference has its primary one beside its snapshot.
// That file is named `Index.reference.webp` or `Index-<variant>.reference.webp`.
// Every other reference, and every reference whose screen has no fixture, is flat in the references folder under its id.
// The fixture rows were read from `componentsDirectory`.
// `committedBeside` holds each committed file beside a snapshot, by its path, to the ids whose manifest rows hold its bytes.
// A map edit that makes another id the variant's primary would move that file to a flat path, so it is refused here,
// Naming the one git mv that makes the move. Nothing is planned when it is refused.
export const planReferenceFiles = (
  referenceMap: Record<string, ParityReference>,
  fixtureRows: FixtureScreenRow[],
  componentsDirectory: string,
  committedBeside: ReadonlyMap<string, readonly string[]>,
): ReferenceFilePlan[] => {
  for (const { directory, name, variant } of fixtureRows) {
    const besidePath = getFixtureReferenceFilePath(join(componentsDirectory, directory), variant);
    const holders = committedBeside.get(besidePath) ?? [];
    const [holder] = holders;
    const primaryId = getPrimaryReferenceId(getVariantEntries(referenceMap, name, variant));
    if (holder === undefined || primaryId === undefined || holders.includes(primaryId)) continue;
    const from = toRepositoryPath(besidePath);
    const to = toRepositoryPath(getFlatReferenceFilePath(holder));
    throw new InvalidOperationError(
      Operation.Update,
      holder,
      `has its committed reference at ${from}, which this map edit would move to ${to}: git mv ${from} ${to} makes the move`,
    );
  }
  const entries = Object.entries(referenceMap).filter(([, { pending }]) => pending === undefined);
  return entries.map(([id, reference]) => {
    const { screen, variant = "" } = reference;
    const fixtureRow = fixtureRows.find((row) => row.name === screen && row.variant === variant);
    const path =
      fixtureRow !== undefined && getPrimaryReferenceId(getVariantEntries(referenceMap, screen, variant)) === id
        ? getFixtureReferenceFilePath(join(componentsDirectory, fixtureRow.directory), variant)
        : getFlatReferenceFilePath(id);
    return { id, path, reference };
  });
};
