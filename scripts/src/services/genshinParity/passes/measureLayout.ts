import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { checkArrangement } from "#src/services/genshinAssets/scene/checkArrangement";
import { ARRANGEMENT_CROSS_RATIO_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { LAYOUT_GATE_METRES } from "#src/services/genshinParity/passes/constants";

// The layout pass, with no pixels: each ratio its references show between parts that meet against the fitted data's,
// And each fitted family's furthest part from the exports' object it stands for
export const measureLayout = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const { families, ratios } = await checkArrangement(component);
  return {
    notes: families.map(
      ({ count, mean, name }) => `${name}: ${count} fitted, ${mean.toFixed(2)} m from the exports on average`,
    ),
    readings: [
      ...ratios.map(({ fitted, measured, name }) => ({
        gate: ARRANGEMENT_CROSS_RATIO_TOLERANCE,
        name,
        unit: "cross-ratio",
        value: Math.abs(fitted - measured),
      })),
      ...families.map(({ largest, name }) => ({ gate: LAYOUT_GATE_METRES, name, unit: "m", value: largest })),
    ],
  };
};
