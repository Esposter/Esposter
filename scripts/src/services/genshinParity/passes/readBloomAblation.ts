/* oxlint-disable no-await-in-loop -- One device: one browser is open at a time, and each structure's frame is read
   before the next opens */
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { BloomAblationRow } from "#src/models/genshinParity/passes/BloomAblationRow";
import type { BloomBaseline } from "#src/models/genshinParity/passes/BloomBaseline";

import { BloomResize } from "#src/models/genshinParity/passes/BloomResize";
import { computeBloomReading } from "#src/services/genshinParity/passes/computeBloomReading";
import { DISPLAY_WIDTH } from "#src/services/genshinParity/passes/constants";
import { getBloomReferenceIds } from "#src/services/genshinParity/passes/getBloomReferenceIds";
import { getCurrentBuildReferenceIds } from "#src/services/genshinParity/passes/getCurrentBuildReferenceIds";
import { listBloomStructures } from "#src/services/genshinParity/passes/listBloomStructures";
import { readBloomBaseline, readBloomedFrame } from "#src/services/genshinParity/passes/readBloomFrames";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";

// The Display pass's bloom reading over every structure of the bloom chain at each measurement, on the references the
// Pass reads it over (`getBloomReferenceIds`). A measurement's baseline is drawn once, and each structure's bloomed
// Frame is read against it, so a structure costs one frame a reference and a measurement one more
export const readBloomAblation = async (
  component: DerivedAssetComponent,
  pageRoot?: string,
): Promise<BloomAblationRow[]> => {
  await fetchReferences();
  const referenceIds = getBloomReferenceIds(getCurrentBuildReferenceIds(component));
  const rows: BloomAblationRow[] = [];
  for (const measurement of Object.values(BloomResize)) {
    const baselines = new Map<string, BloomBaseline>();
    for (const referenceId of referenceIds)
      baselines.set(referenceId, await readBloomBaseline(referenceId, component, measurement, pageRoot));
    for (const structure of listBloomStructures()) {
      const readings: Record<string, number> = {};
      for (const [referenceId, baseline] of baselines) {
        const bloomed = await readBloomedFrame(referenceId, component, measurement, structure, pageRoot);
        readings[referenceId] = computeBloomReading(
          baseline.reference,
          bloomed,
          baseline.unbloomed,
          DISPLAY_WIDTH,
          baseline.height,
        );
      }
      rows.push({ measurement, readings, structure });
      console.log(`${measurement} ${JSON.stringify(structure)} ${JSON.stringify(readings)}`);
    }
  }
  return rows;
};
