import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";
import type { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";

import { withReferencePage } from "#src/services/genshinParity/shared/withReferencePage";

// Each reference's measure taken on its own witness page, closed once its measure settles, and the notes and readings of
// Every measure gathered in order. The caller fetches the references first
export const measureEachReference = async (
  component: DerivedAssetComponent,
  referenceIds: readonly string[],
  measureReference: (
    referenceId: string,
    openedPage: Awaited<ReturnType<typeof openWitnessPage>>,
  ) => Promise<ParityPassMeasure>,
  width?: number,
): Promise<ParityPassMeasure> => {
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of referenceIds)
    measures.push(
      // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
      await withReferencePage(referenceId, component, (openedPage) => measureReference(referenceId, openedPage), width),
    );
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
