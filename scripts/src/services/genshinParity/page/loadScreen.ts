import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";
import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { LoadBench } from "genshin-world/parity/models/LoadBench";

import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";

// A screen's load on the parity page, opened cold and read the moment it signals ready: the milliseconds from navigation
// Start to that moment, then the page's load bench, which reads the load steps' measures, the requests and the scene
export const loadScreen = async (options: ParityPageOptions): Promise<LoadReading> => {
  const { close, page } = await openParityPage({ ...options, isFrameRateUnlimited: false });
  return withFinalizerAsync(
    async () => {
      const readyMs = await page.evaluate(() => performance.now());
      const bench = await page.evaluate(() => (Reflect.get(window, "benchLoad") as () => LoadBench)());
      return { bench, readyMs };
    },
    () => close(),
  );
};
