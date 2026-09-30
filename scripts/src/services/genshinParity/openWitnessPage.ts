import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Browser, Page } from "playwright";

import { REFERENCES_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// One reference's page for the witness tools: the parity page on the reference's screen in its own state (its props, a
// Time of day), at the structure's width and the reference's aspect, drawing the component's exports, beside the
// Reference at that size. The caller fetches the references first and closes the browser
export const openWitnessPage = async (
  referenceId: string,
  witness: DerivedAssetComponent,
): Promise<{ browser: Browser; height: number; image: Buffer; page: Page }> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
  const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
  const { height: referenceHeight, width: referenceWidth } = await sharp(referencePath).metadata();
  const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
  const image = await sharp(referencePath).resize(STRUCTURE_WIDTH, height).removeAlpha().png().toBuffer();
  const { browser, page } = await openParityPage({
    height,
    props: reference.props,
    screen: reference.screen,
    width: STRUCTURE_WIDTH,
    witness,
  });
  return { browser, height, image, page };
};
