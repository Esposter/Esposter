import type { CrossingReading } from "#src/models/genshinParity/page/CrossingReading";
import type { ScreenCrossing } from "#src/models/genshinParity/ScreenCrossing";
import type { LoadBench } from "genshin-world/parity/models/LoadBench";
import type { Page } from "playwright";

import { PARITY_READY_TIMEOUT_MS } from "#src/services/genshinParity/shared/constants";
import { LOAD_STEP_MEASURE_PREFIX } from "genshin-world";

declare global {
  interface Window {
    benchLoad: (from: number) => LoadBench;
    setScreenProps: (screenProps: Record<string, unknown>) => void;
  }
}

// A ready screen moved to its crossing's props, read once the step its crossing settles on is measured after the move:
// The milliseconds from the move to that measure's end, then the page's load bench from the move
export const crossScreen = async (page: Page, { settleStep, toProps }: ScreenCrossing): Promise<CrossingReading> => {
  const since = await page.evaluate((props) => {
    const start = performance.now();
    window.setScreenProps(props);
    return start;
  }, toProps);
  const settled = await page.waitForFunction(
    ([name, start]) => {
      const measure = performance.getEntriesByName(name, "measure").find(({ startTime }) => startTime >= start);
      return measure && measure.startTime + measure.duration - start;
    },
    [`${LOAD_STEP_MEASURE_PREFIX}${settleStep}`, since] as const,
    { timeout: PARITY_READY_TIMEOUT_MS },
  );
  const settledMs = (await settled.jsonValue()) ?? 0;
  const bench = await page.evaluate((start) => window.benchLoad(start), since);
  return { bench, settledMs };
};
