import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { Browser, Page } from "playwright";

import { REFERENCES_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// One reference's page for the witness tools: the parity page on the reference's screen in its own state (its props, a
// Time of day), at the structure's width unless another is given and the reference's aspect, drawing the component's exports, beside the
// Reference at that size, and whether a pixel of a target that wide stands in the reference's scored region, so a tool
// Reads nothing a recording masks or a corner button covers. The caller fetches the references first and closes the
// Browser
export const openWitnessPage = async (
  referenceId: string,
  witness: DerivedAssetComponent,
  width: number = STRUCTURE_WIDTH,
): Promise<{
  browser: Browser;
  checkIsScored: (pixel: number, width: number) => boolean;
  height: number;
  image: Buffer;
  page: Page;
}> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const { height: referenceHeight, width: referenceWidth } = await sharp(referencePath).metadata();
  const height = Math.round((width / referenceWidth) * referenceHeight);
  const image = await sharp(referencePath).resize(width, height).removeAlpha().png().toBuffer();
  const { browser, page } = await openParityPage({
    height,
    props: reference.props,
    screen: reference.screen,
    width,
    witness,
  });
  const { region } = reference;
  const checkIsScored = (pixel: number, targetWidth: number): boolean => {
    if (!region) return true;
    const scale = targetWidth / referenceWidth;
    const [column, row] = [pixel % targetWidth, Math.floor(pixel / targetWidth)];
    return (
      column >= region.x * scale &&
      column < (region.x + region.width) * scale &&
      row >= region.y * scale &&
      row < (region.y + region.height) * scale
    );
  };
  return { browser, checkIsScored, height, image, page };
};
