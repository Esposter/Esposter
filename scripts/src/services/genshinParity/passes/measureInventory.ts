import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";
import type { WitnessClaim } from "genshin-world/parity/models/witness/WitnessClaim";

import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { InvalidOperationError, Operation, takeOne, withFinalizerAsync } from "@esposter/shared";

// The inventory pass: every renderer of the component's exports claimed by a part of the scene, drawn or named as not
// Drawn yet, as its screen's fixture claims them on the parity page, opened on any of its references
export const measureInventory = async (component: DerivedAssetComponent): Promise<ParityPassMeasure> => {
  const referenceIds = getComponentReferenceIds(component);
  if (referenceIds.length === 0) throw new InvalidOperationError(Operation.Read, component, "no reference to open");
  await fetchReferences();
  const { browser, page } = await openWitnessPage(takeOne(referenceIds), component);
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
    () => browser.close(),
  );
};
