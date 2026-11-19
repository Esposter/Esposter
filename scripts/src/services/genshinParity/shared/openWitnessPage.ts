import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Page } from "playwright";

import { checkIsScoredPixel } from "#src/services/genshinParity/shared/checkIsScoredPixel";
import { STRUCTURE_WIDTH, WORLD_SCREEN_PREFIX } from "#src/services/genshinParity/shared/constants";
import { getPageWidth } from "#src/services/genshinParity/shared/getPageWidth";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { readReferenceImage } from "#src/services/genshinParity/shared/readReferenceImage";
import { InvalidOperationError, Operation } from "@esposter/shared";
import sharp from "sharp";

// One reference's page for the witness tools: the parity page on the reference's screen in its own state (its props, a
// Time of day), at the structure's width unless another is given and the reference's aspect, drawing the component's
// Exports, beside the reference at that size, and whether a pixel of a target that wide stands in the reference's
// Scored region, so a tool reads nothing a recording masks or a corner button covers. A World screen's page is never
// Shorter than the interface (`getPageWidth`), so its pixels are the canvas's. The caller fetches the References first
// And closes the page
export const openWitnessPage = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  width: number = STRUCTURE_WIDTH,
  // The only meshes the witness keeps, for a page that draws a few of a component's parts (`ParityPageOptions`)
  witnessMeshes?: readonly string[],
  // Props the page is opened with over its reference's own, for a shot of the same state with one prop changed, such as
  // The login's frame without its bloom
  propOverrides?: Record<string, unknown>,
  // The parity page's root, for a run that shot its screen on a fresh page rather than the one a probe finds
  pageRoot?: string,
): Promise<{
  checkIsScored: (pixel: number, width: number) => boolean;
  close: () => Promise<void>;
  height: number;
  image: Buffer;
  page: Page;
}> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
  const referencePath = await getReferencePath(referenceId);
  const { height: referenceHeight, width: referenceWidth } = await sharp(referencePath).metadata();
  const pageWidth = getPageWidth({
    isWorldScreen: reference.screen.startsWith(WORLD_SCREEN_PREFIX),
    referenceHeight,
    referenceWidth,
    requestedWidth: width,
  });
  const height = Math.round((pageWidth / referenceWidth) * referenceHeight);
  // The reference is read at its own size by `readReferenceImage`, which owns why a WebP's shrink is left to the
  // Resize
  const image = await readReferenceImage(referencePath, pageWidth, height);
  const { close, page } = await openParityPage({
    height,
    pageRoot,
    props: { ...reference.props, ...propOverrides },
    screen: reference.screen,
    width: pageWidth,
    witness,
    witnessMeshes,
  });
  const { region } = reference;
  const checkIsScored = (pixel: number, targetWidth: number): boolean =>
    !region || checkIsScoredPixel(region, referenceWidth, pixel, targetWidth);
  return { checkIsScored, close, height, image, page };
};
