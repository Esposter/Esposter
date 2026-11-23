import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { PARITY_PASS_ORDER } from "#src/services/genshinParity/passes/constants";
import { ParityPassMeasureMap } from "#src/services/genshinParity/passes/ParityPassMeasureMap";

// A component's passes in their order, each measured and held against its gates, up to and including the first that
// Fails one, measures nothing, or has no measure yet: the next work, since a pass begun over a failing one absorbs its
// Error into its own answer. A pass the scene is not owed is printed and passed over, since it has nothing to absorb.
// Given one pass, the run covers the passes up to and including it, so a pass an earlier one still holds open is
// Refused: Its last result is the open pass, and the pass itself is never measured. A `pageRoot` is the parity page the
// Measures Open, so a run that shot its screen on a fresh page measures that page, not the one a probe from the first
// Port finds
export const runParityPasses = async (
  component: DerivedAssetComponent,
  { pageRoot, passAlone }: { pageRoot?: string | undefined; passAlone?: ParityPass | undefined } = {},
): Promise<ParityPassResult[]> => {
  const results: ParityPassResult[] = [];
  const passes = passAlone ? PARITY_PASS_ORDER.slice(0, PARITY_PASS_ORDER.indexOf(passAlone) + 1) : PARITY_PASS_ORDER;
  for (const pass of passes) {
    const measurePass = ParityPassMeasureMap[pass];
    if (!measurePass) {
      results.push({ isHeld: false, measure: { notes: ["no measure yet"], readings: [] }, pass });
      break;
    }
    // Since a pass begun over a failing one absorbs its error
    // oxlint-disable-next-line no-await-in-loop -- Stop at the first: a pass runs only once the passes before it hold,
    const measure = await measurePass(component, pageRoot);
    if (measure.isNotOwed) {
      console.log(`${pass}: not owed for ${component}`);
      continue;
    }
    const isHeld = measure.readings.length > 0 && measure.readings.every((reading) => checkIsReadingHeld(reading));
    results.push({ isHeld, measure, pass });
    if (!isHeld) break;
  }
  return results;
};
