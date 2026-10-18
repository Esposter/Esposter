import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { ScreenCrossing } from "#src/models/genshinParity/ScreenCrossing";
import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";
import type { LoadBench } from "genshin-world/parity/models/LoadBench";

import { crossScreen } from "#src/services/genshinParity/page/crossScreen";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";

// A screen's load on the parity page, opened cold and read the moment it signals ready: the milliseconds from navigation
// Start to that moment, then the page's load bench, which reads the load steps' measures, the requests and the scene.
// Given a crossing, the screen is then moved and its crossing read once settled
export const loadScreen = async (options: ParityPageOptions, crossing?: ScreenCrossing): Promise<LoadReading> => {
  // Opened at its load event rather than once idle, so a fetch issued after ready is not counted into the reading
  const { close, page } = await openParityPage({ ...options, isFrameRateUnlimited: false, isOpenedAtLoad: true });
  return withFinalizerAsync(
    async () => {
      // Both readings in one evaluate, so the bench and the ready milliseconds are taken together at the ready signal
      const { bench, readyMs } = await page.evaluate(() => ({
        bench: (Reflect.get(window, "benchLoad") as () => LoadBench)(),
        readyMs: performance.now(),
      }));
      if (!crossing) return { bench, readyMs };
      return { bench, crossing: await crossScreen(page, crossing), readyMs };
    },
    () => close(),
  );
};
