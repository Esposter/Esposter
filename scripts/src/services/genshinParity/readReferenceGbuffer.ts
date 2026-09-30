import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";
import type { PageWitnessView } from "#src/services/genshinParity/setPageWitnessView";

import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { readWitnessGbuffer } from "#src/services/genshinParity/readWitnessGbuffer";
import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import { withFinalizerAsync } from "@esposter/shared";

// A reference's witness G-buffer at the reference's own view, or the pose given, beside the reference at the
// Structure's width and the colour shot of that view: the view is set once, holding the scene's clock, and drawn in one
// Frame before its targets are read
export const readReferenceGbuffer = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  camera?: PageWitnessView["camera"],
): Promise<{ gbuffer: WitnessGbuffer; image: Buffer; shot: Buffer }> => {
  await fetchReferences();
  const { browser, image, page } = await openWitnessPage(referenceId, witness);
  return withFinalizerAsync(
    async () => {
      await setPageWitnessView(page, { camera });
      const shot = await page.screenshot({ animations: "disabled" });
      return { gbuffer: await readWitnessGbuffer(page), image, shot };
    },
    () => browser.close(),
  );
};
