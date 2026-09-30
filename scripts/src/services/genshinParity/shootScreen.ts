import { ParityMotion } from "#src/models/genshinParity/ParityMotion";
import { INTERFACE_HEIGHT, PARITY_PAGE_URL, SHOTS_DIRECTORY } from "#src/services/genshinParity/constants";
import { InvalidOperationError, Operation, withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

// The parity page's screen in the machine's own Edge, at the game's interface height and the reference's aspect,
// Drawn at the reference's pixel size. With times, the motion named (the entry, or the fixture's motion props) is held
// At each one in turn, so it is shot frame by frame at exact moments rather than raced
export const shootScreen = async (
  screen: string,
  width: number,
  height: number,
  timesMs: number[],
  motion: ParityMotion = ParityMotion.Props,
  props?: Record<string, unknown>,
): Promise<string[]> => {
  await mkdir(SHOTS_DIRECTORY, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge" });
  const deviceScaleFactor = height / INTERFACE_HEIGHT;
  const paths = await withFinalizerAsync(
    async () => {
      const page = await browser.newPage({
        deviceScaleFactor,
        viewport: { height: INTERFACE_HEIGHT, width: Math.round(width / deviceScaleFactor) },
      });
      // A still is the fixture's first state; shooting at times asks the page to hold the motion it names
      const motionQuery = timesMs.length > 0 ? `&motion=${motion}` : "";
      const propsQuery = props ? `&props=${encodeURIComponent(JSON.stringify(props))}` : "";
      await page.goto(`${PARITY_PAGE_URL}${screen}${motionQuery}${propsQuery}`, { waitUntil: "networkidle" });
      const readyScreen = await page.locator("[data-parity-ready]").getAttribute("data-parity-ready");
      // An unknown name draws the list of screens, which would otherwise be shot and scored as the screen
      if (readyScreen !== screen)
        throw new InvalidOperationError(Operation.Read, screen, "not a screen with a fixture on the parity page");
      const shotPaths: string[] = [];
      if (timesMs.length === 0) {
        const path = join(SHOTS_DIRECTORY, `${screen}.png`);
        await page.screenshot({ animations: "disabled", path });
        shotPaths.push(path);
      }

      for (const timeMs of timesMs) {
        // oxlint-disable-next-line no-await-in-loop -- one page is paused at one time and shot before the next, in order
        await page.evaluate((currentTime) => {
          for (const animation of window.document.getAnimations()) {
            animation.pause();
            animation.currentTime = currentTime;
          }
        }, timeMs);
        const path = join(SHOTS_DIRECTORY, `${screen}.${motion}@${timeMs}.png`);
        // oxlint-disable-next-line no-await-in-loop -- the shot belongs to the time just set, before the next one is
        await page.screenshot({ path });
        shotPaths.push(path);
      }

      return shotPaths;
    },
    () => browser.close(),
  );
  for (const path of paths) console.log(path);
  return paths;
};
