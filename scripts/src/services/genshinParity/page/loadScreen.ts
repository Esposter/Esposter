import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";
import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";

import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";

// A screen's load on the parity page, opened cold and read by the page itself the moment it signals ready: the milliseconds
// From navigation start to that moment, and the page's load bench taken then, which reads the load steps' measures, the
// Requests and the scene
export const loadScreen = async (options: ParityPageOptions): Promise<LoadReading> => {
  const { close, page } = await openParityPage({ ...options, isFrameRateUnlimited: false });
  return withFinalizerAsync(
    () => page.evaluate(() => Reflect.get(window, "loadReading") as LoadReading),
    () => close(),
  );
};
