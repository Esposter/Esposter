import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { formatSkyComparison } from "#src/services/genshinParity/sky/formatSkyComparison";
import { readCloudStatistics } from "#src/services/genshinParity/sky/readCloudStatistics";
import { toSkyReadings } from "#src/services/genshinParity/sky/toSkyReadings";

// The atmosphere pass: at each current build's reference's camera, its sky and the scene's as statistics blind to
// Where their clouds stand (`readCloudStatistics`), each held within the spread two halves of the reference's own sky
// Stand apart, and the clear sky's colour within the distance two colours side by side are told apart at
export const measureAtmosphere = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const measures: ParityPassMeasure[] = [];
  for (const referenceId of getCurrentBuildReferenceIds(component)) {
    // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
    const { distance, ours, reference, skyCount, spread } = await readCloudStatistics(referenceId, component);
    measures.push({
      notes: [`${referenceId}: ${skyCount} pixels of sky; ${formatSkyComparison(ours, reference)}`],
      readings: toSkyReadings(referenceId, distance, spread),
    });
  }
  return { notes: measures.flatMap(({ notes }) => notes), readings: measures.flatMap(({ readings }) => readings) };
};
