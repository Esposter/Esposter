import type { Page } from "playwright";

import { setPageWitnessView } from "#src/services/genshinParity/setPageWitnessView";
import sharp from "sharp";

// The witness page's frame with the exports drawn in place of the families given and the scene's own parts for the
// Rest, at the size given, as a PNG: every family the exports, none the scene alone
export const shootWitnessFamilies = async (
  page: Page,
  families: string[],
  { height, width }: { height: number; width: number },
): Promise<Buffer> => {
  await setPageWitnessView(page, { families });
  return sharp(await page.screenshot())
    .resize(width, height, { fit: "fill" })
    .png()
    .toBuffer();
};
