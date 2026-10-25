import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";
import type { CpuProfiler } from "#src/models/genshinParity/shared/CpuProfiler";
import type { BrowserContext, Page } from "playwright";

import { MICROSECONDS_PER_MS } from "#src/services/genshinParity/shared/constants";

const CPU_SAMPLE_MICROSECONDS = 200;

// The page's main-thread samples over the run, which a slow frame with no GPU call in it is named by. The profile's clock is
// Read against the page's own clock at the start, so each sample's time is the frame times' time
export const startCpuProfile = async (context: BrowserContext, page: Page): Promise<CpuProfiler> => {
  const session = await context.newCDPSession(page);
  await session.send("Profiler.enable");
  await session.send("Profiler.setSamplingInterval", { interval: CPU_SAMPLE_MICROSECONDS });
  const pageNowMs = await page.evaluate(() => performance.now());
  await session.send("Profiler.start");

  return {
    stop: async (): Promise<CpuCapture> => {
      const { profile } = await session.send("Profiler.stop");
      return {
        nodes: profile.nodes ?? [],
        offsetMs: profile.startTime / MICROSECONDS_PER_MS - pageNowMs,
        samples: profile.samples ?? [],
        startTime: profile.startTime,
        timeDeltas: profile.timeDeltas ?? [],
      };
    },
  };
};
