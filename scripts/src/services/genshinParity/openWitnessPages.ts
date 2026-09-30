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
// A witness page for every reference given, opened side by side; the caller closes their browsers. Every opening
// Settles before anything is raised, so a failed one closes the browsers its siblings opened rather than leaving them
// Running with no caller to close them
export const openWitnessPages = async (
  referenceIds: readonly string[],
  witness: DerivedAssetComponent,
): Promise<WitnessPage[]> => {
  await fetchReferences();
  const results = await Promise.allSettled(
    referenceIds.map(async (referenceId) => {
      const reference = ParityReferenceMap[referenceId];
      if (!reference) throw new InvalidOperationError(Operation.Read, referenceId, "not a reference");
      const referencePath = join(REFERENCES_DIRECTORY, `${referenceId}.png`);
      const { height: referenceHeight, width: referenceWidth } = await sharp(referencePath).metadata();
      const height = Math.round((STRUCTURE_WIDTH / referenceWidth) * referenceHeight);
      const image = await sharp(referencePath).resize(STRUCTURE_WIDTH, height).removeAlpha().png().toBuffer();
      // The scorer before the browser, so nothing can fail once the browser is open
      const scoreLines = await createLineDistanceScorer(image, height);
      const { browser, page } = await openParityPage({
        height,
        props: reference.props,
        screen: reference.screen,
        width: STRUCTURE_WIDTH,
        witness,
      });
      return { browser, height, image, page, referenceId, scoreLines };
    }),
  );
  const pages: WitnessPage[] = [];
  const reasons: unknown[] = [];
  for (const result of results)
    if (result.status === "rejected") reasons.push(result.reason);
    else pages.push(result.value);
  if (reasons.length === 0) return pages;
  await Promise.allSettled(pages.map(({ browser }) => browser.close()));
  throw reasons[0];
};
