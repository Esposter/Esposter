import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Browser, Page } from "playwright";

import { REFERENCES_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/constants";
import { createLineDistanceScorer } from "#src/services/genshinParity/createLineDistanceScorer";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import sharp from "sharp";

// One reference's page for the witness tools: the parity page on the reference's screen in its own state (its props, a
// Time of day), at the structure's width and the reference's aspect, drawing the component's exports; the reference at
// That size; and a scorer of a shot's towers against it
export interface WitnessPage {
  browser: Browser;
  height: number;
  image: Buffer;
  page: Page;
  referenceId: string;
  scoreLines: (shot: Buffer) => Promise<number>;
}
// A witness page for every reference given, opened side by side; the caller closes their browsers
export const openWitnessPages = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
): Promise<WitnessPage[]> => {
  await fetchReferences();
  return Promise.all(
    referenceIds.map(async (referenceId) => {
      const reference = ParityReferenceMap[referenceId];
      if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
      const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
      const { height: referenceHeight, width: referenceWidth } = await sharp(referencePath).metadata();
      const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
      const image = await sharp(referencePath).resize(STRUCTURE_WIDTH, height).removeAlpha().png().toBuffer();
      const [scoreLines, { browser, page }] = await Promise.all([
        createLineDistanceScorer(image, height),
        openParityPage({ height, props: reference.props, screen: reference.screen, width: STRUCTURE_WIDTH, witness }),
      ]);
      return { browser, height, image, page, referenceId, scoreLines };
    }),
  );
};
