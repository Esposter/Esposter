import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Page } from "playwright";

import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The parity page drawing a component's exports on its screen, in the state of its first reference, for a pass whose
// Measure holds in any state. The caller closes the page
export const openComponentWitnessPage = async (
  component: DerivedAssetComponent,
): Promise<{ close: () => Promise<void>; page: Page }> => {
  const referenceIds = getComponentReferenceIds(component);
  if (referenceIds.length === 0) throw new InvalidOperationError(Operation.Read, component, "no reference to open");
  await fetchReferences();
  return openWitnessPage(takeOne(referenceIds), component);
};
