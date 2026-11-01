import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { ScreenCrossing } from "#src/models/genshinParity/ScreenCrossing";
import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";

import { crossScreen } from "#src/services/genshinParity/page/crossScreen";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";

// A screen's load on the parity page, opened cold and read the moment it signals ready: the milliseconds from navigation
// Start to that moment, then the page's load bench, which reads the load steps' measures, the requests and the scene.
// Given a crossing, the screen is then moved and its crossing read once settled
export const loadScreen = async (options: ParityPageOptions, crossing?: ScreenCrossing): Promise<LoadReading> => {
  const { close, page } = await openParityPage({ ...options, isFrameRateUnlimited: false });
  return withFinalizerAsync(
    async () => {
      // The page takes both readings as it signals ready, so a fetch it issues after the signal is not in them
      const { bench, readyMs } = await page.evaluate(() => Reflect.get(window, "loadAtReady") as LoadReading);
      if (!crossing) return { bench, readyMs };
      return { bench, crossing: await crossScreen(page, crossing), readyMs };
    },
    () => close(),
  );
};
