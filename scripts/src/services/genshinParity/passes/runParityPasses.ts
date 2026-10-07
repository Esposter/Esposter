import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { ParityPassMeasureMap } from "#src/services/genshinParity/passes/ParityPassMeasureMap";

// A component's passes in their order, each measured and held against its gates, up to and including the first that
// Fails one, measures nothing, or has no measure yet: the next work, since a pass begun over a failing one absorbs its
// Error into its own answer
export const runParityPasses = async (component: DerivedAssetComponent): Promise<ParityPassResult[]> => {
  const results: ParityPassResult[] = [];
  for (const pass of Object.values(ParityPass)) {
    const measurePass = ParityPassMeasureMap[pass];
    // oxlint-disable-next-line no-await-in-loop -- each pass runs only once every pass before it holds
    const measure = measurePass ? await measurePass(component) : { notes: ["no measure yet"], readings: [] };
    const isHeld = measure.readings.length > 0 && measure.readings.every(({ gate, value }) => value <= gate);
    results.push({ isHeld, measure, pass });
    if (!isHeld) break;
  }
  return results;
};
