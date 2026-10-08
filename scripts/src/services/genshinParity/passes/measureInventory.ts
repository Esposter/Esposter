import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { WitnessClaim } from "genshin-world/parity/models/witness/WitnessClaim";

import { openComponentWitnessPage } from "#src/services/genshinParity/passes/openComponentWitnessPage";
import { withFinalizerAsync } from "@esposter/shared";

// The inventory pass: every renderer of the component's exports claimed by a part of the scene, drawn or named as not
// Drawn yet, as its screen's fixture claims them on the parity page
export const measureInventory = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const { close, page } = await openComponentWitnessPage(component);
  return withFinalizerAsync(
    async () => {
      const claims = await page.evaluate(() =>
        (Reflect.get(window, "claimWitnessRenderers") as () => WitnessClaim[])(),
      );
      const unclaimed = claims.filter(({ claim }) => !claim);
      return {
        notes: [
          ...unclaimed.map(({ renderer }) => `unclaimed: ${renderer}`),
          ...claims
            .filter(({ claim, isDrawn }) => claim && !isDrawn)
            .map(({ claim, renderer }) => `not drawn yet, as ${claim}: ${renderer}`),
        ],
        readings: [{ gate: 0, name: "renderers unclaimed", unit: "renderers", value: unclaimed.length }],
      };
    },
    () => close(),
  );
};
