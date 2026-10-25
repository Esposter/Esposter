import type { StallState } from "#src/models/genshinParity/shared/StallState";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";
import type { Page } from "playwright";

import { readPrograms } from "#src/services/genshinParity/shared/readPrograms";
import { summarizeStallState } from "#src/services/genshinParity/shared/summarizeStallState";

// One state: the frames drawn while its drive runs, summarised with the programs held before and after it
export const measureState = async (
  page: Page,
  name: string,
  drive: () => Promise<void>,
): Promise<TracedState & { state: StallState }> => {
  await page.evaluate(() => {
    window.__frameTimes = [];
  });
  const programsBefore = await readPrograms(page);
  await drive();
  const frames = await page.evaluate(() => window.__frameTimes);
  const programsAfter = await readPrograms(page);

  return { frames, name, state: summarizeStallState(name, frames, programsBefore, programsAfter) };
};
