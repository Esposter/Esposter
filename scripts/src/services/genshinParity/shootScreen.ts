import type { ShootOptions } from "#src/models/genshinParity/ShootOptions";

import { ParityMotion } from "#src/models/genshinParity/ParityMotion";
import { SHOTS_DIRECTORY } from "#src/services/genshinParity/constants";
import { openParityPage } from "#src/services/genshinParity/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// The parity page's screen shot at the reference's pixel size. With times, the motion named (the entry, or the
// Fixture's motion props) is held at each one in turn, so it is shot frame by frame at exact moments rather than raced
export const shootScreen = async ({
  motion = ParityMotion.Props,
  screen,
  timesMs = [],
  ...options
}: ShootOptions): Promise<string[]> => {
  await mkdir(SHOTS_DIRECTORY, { recursive: true });
  // A still is the fixture's first state; shooting at times asks the page to hold the motion it names
  const { browser, page } = await openParityPage({
    ...options,
    motion: timesMs.length > 0 ? motion : undefined,
    screen,
  });
  const paths = await withFinalizerAsync(
    async () => {
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
