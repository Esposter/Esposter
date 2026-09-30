import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { Browser, Page } from "playwright";

import { createLineDistanceScorer } from "#src/services/genshinParity/createLineDistanceScorer";
import { fetchReferences } from "#src/services/genshinParity/fetchReferences";
import { openWitnessPage } from "#src/services/genshinParity/openWitnessPage";
import { getResultAsync } from "@esposter/shared";

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
      const { browser, height, image, page } = await openWitnessPage(referenceId, witness);
      // A scorer that fails closes the browser just opened, since no caller receives it
      const scoreLines = await getResultAsync(() => createLineDistanceScorer(image, height)).match(
        (scorer) => scorer,
        async (error) => {
          await browser.close();
          throw error;
        },
      );
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
