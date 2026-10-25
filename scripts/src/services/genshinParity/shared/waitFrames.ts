import type { FrameRange } from "#src/models/genshinParity/shared/FrameRange";
import type { Page } from "playwright";

export const waitFrames = (page: Page, count: number): Promise<FrameRange> =>
  page.evaluate((frameCount) => window.__waitFrames?.(frameCount) ?? { endFrame: 0, firstFrame: 0 }, count);
