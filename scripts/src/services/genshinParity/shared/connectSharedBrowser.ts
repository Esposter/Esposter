import type { SharedBrowser } from "#src/models/genshinParity/shared/SharedBrowser";
import type { Browser } from "playwright";

import { SHARED_BROWSER_CONNECT_TIMEOUT_MS } from "#src/services/genshinParity/shared/constants";
import { getResultAsync } from "@esposter/shared";
import { chromium } from "playwright";

// The shared browser a command opens its pages in, or nothing when none was started or the one written no longer
// Answers, a stale file after the browser's process has died, so the command launches its own as it always did
export const connectSharedBrowser = (sharedBrowser: SharedBrowser | undefined): Promise<Browser | undefined> =>
  sharedBrowser
    ? getResultAsync(() =>
        chromium.connect(sharedBrowser.wsEndpoint, { timeout: SHARED_BROWSER_CONNECT_TIMEOUT_MS }),
      ).match(
        (browser) => browser,
        (error) => {
          console.warn(
            `The shared browser at ${sharedBrowser.wsEndpoint} does not answer, so this command launches its own`,
          );
          console.warn(error);
          return undefined;
        },
      )
    : Promise.resolve(undefined);
