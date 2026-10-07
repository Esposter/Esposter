import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { checkArrangement } from "#src/services/genshinAssets/scene/checkArrangement";
import { ARRANGEMENT_CROSS_RATIO_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { LAYOUT_GATE_METRES } from "#src/services/genshinParity/passes/constants";
import { openComponentWitnessPage } from "#src/services/genshinParity/passes/openComponentWitnessPage";
import { withFinalizerAsync } from "@esposter/shared";

// The layout pass: each ratio its references show between parts that meet against the fitted data's, each fitted
// Family's furthest part from the exports' objects it stands for, and how far across and up the scene stands each
// Family of the witness off its laid-out place past what the game's own data explains (along the glide is its motion)
export const measureLayout = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const [{ explainedOffsets, families, ratios }, { browser, page }] = await Promise.all([
    checkArrangement(component),
    openComponentWitnessPage(component),
  ]);
  const familyOffsets = await withFinalizerAsync(
    () =>
      page.evaluate(() =>
        (Reflect.get(window, "getWitnessFamilyOffsets") as () => Record<string, [number, number, number]>)(),
      ),
    () => browser.close(),
  );
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
      ...Object.entries(familyOffsets).flatMap(([family, [x, y]]) => {
        const [explainedX, explainedY] = explainedOffsets[family] ?? [0, 0];
        return [
          { gate: LAYOUT_GATE_METRES, name: `${family} row across`, unit: "m", value: Math.abs(x - explainedX) },
          { gate: LAYOUT_GATE_METRES, name: `${family} row up`, unit: "m", value: Math.abs(y - explainedY) },
        ];
      }),
    ],
  };
};
