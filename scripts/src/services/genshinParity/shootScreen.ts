import { INTERFACE_HEIGHT, PARITY_PAGE_URL, SHOTS_DIRECTORY } from "#src/services/genshinParity/constants";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

// The parity page's screen in the machine's own Edge, at the game's interface height and the reference's aspect,
// Drawn at the reference's pixel size. With times, every animation is paused at each one in turn, so a motion is
// Shot frame by frame at exact moments rather than raced
export const shootScreen = async (
  screen: string,
  width: number,
  height: number,
  timesMs: number[],
): Promise<string[]> => {
  await mkdir(SHOTS_DIRECTORY, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge" });
  const deviceScaleFactor = height / INTERFACE_HEIGHT;
  const page = await browser.newPage({
    deviceScaleFactor,
    viewport: { height: INTERFACE_HEIGHT, width: Math.round(width / deviceScaleFactor) },
  });
  await page.goto(`${PARITY_PAGE_URL}${screen}`, { waitUntil: "networkidle" });
  await page.locator("[data-parity-ready]").waitFor();
  const paths: string[] = [];
  if (timesMs.length === 0) {
    const path = join(SHOTS_DIRECTORY, `${screen}.png`);
    await page.screenshot({ animations: "disabled", path });
    paths.push(path);
  }

  for (const timeMs of timesMs) {
    // oxlint-disable-next-line no-await-in-loop -- one page is paused at one time and shot before the next, in order
    await page.evaluate((currentTime) => {
      for (const animation of window.document.getAnimations()) {
        animation.pause();
        animation.currentTime = currentTime;
      }
    }, timeMs);
    const path = join(SHOTS_DIRECTORY, `${screen}@${timeMs}.png`);
    // oxlint-disable-next-line no-await-in-loop -- the shot belongs to the time just set, before the next one is
    await page.screenshot({ path });
    paths.push(path);
  }

  await browser.close();
  for (const path of paths) console.log(path);
  return paths;
};
