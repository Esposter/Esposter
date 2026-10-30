// The locator's screenshot as base64, which is all the guard compares
interface ScreenshotLocator {
  screenshot: (options: { base64: true }) => Promise<{ base64: string }>;
}

// Frames passed between captures, and how many later captures each is compared with.
// So a render that settles only after a frame or two is seen, not taken for stable on the first pair that agree
const SETTLE_FRAME_COUNT = 2;
const LATER_CAPTURE_COUNT = 3;

// The update path's guard, which both visual suites run before they write an image: a render whose captures change over
// Frames is not one frame of the screen, and an image of it would be whichever frame the matcher's first stable pair
// Landed on. It throws, naming the case, so the case fails and its image is not written
export const assertSettledRender = async (locator: ScreenshotLocator, name: string): Promise<void> => {
  const first = await locator.screenshot({ base64: true });
  for (let capture = 0; capture < LATER_CAPTURE_COUNT; capture++) {
    for (let frame = 0; frame < SETTLE_FRAME_COUNT; frame++)
      // oxlint-disable-next-line no-await-in-loop -- each frame is waited on after the one before it
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    // oxlint-disable-next-line no-await-in-loop -- each capture is taken once the frames before it have settled
    const later = await locator.screenshot({ base64: true });
    if (later.base64 !== first.base64)
      // oxlint-disable-next-line error-handling/no-bare-error -- genshin-interface does not depend on @esposter/shared
      throw new Error(
        `${name}: its render changed within ${(capture + 1) * SETTLE_FRAME_COUNT} frames, so an image of it would be one frame of it`,
      );
  }
};
