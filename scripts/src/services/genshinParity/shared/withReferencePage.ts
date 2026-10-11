import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { openWitnessPage } from "#src/services/genshinParity/shared/openWitnessPage";
import { withFinalizerAsync } from "@esposter/shared";

// Runs a read over one reference's witness page at the width given, or the structure's, and closes the page once the read
// Settles. The caller fetches the references first
export const withReferencePage = async <T>(
  referenceId: string,
  witness: DerivedAssetComponent,
  read: (openedPage: Awaited<ReturnType<typeof openWitnessPage>>) => Promise<T>,
  width?: number,
): Promise<T> => {
  const openedPage = await openWitnessPage(referenceId, witness, width);
  return withFinalizerAsync(
    () => read(openedPage),
    () => openedPage.close(),
  );
};
