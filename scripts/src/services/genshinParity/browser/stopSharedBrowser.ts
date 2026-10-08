import { SHARED_BROWSER_PATH } from "#src/services/genshinParity/shared/constants";
import { readSharedBrowser } from "#src/services/genshinParity/shared/readSharedBrowser";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

// Ends the shared browser by its process and the Edge under it, a tree kill since a plain one leaves the Edge running
export const stopSharedBrowser = (): void => {
  const sharedBrowser = readSharedBrowser();
  if (!sharedBrowser) {
    console.log("No shared browser is running");
    return;
  }
  const { status } = spawnSync("taskkill", ["/PID", String(sharedBrowser.processId), "/T", "/F"], {
    stdio: "ignore",
    windowsHide: true,
  });
  if (status !== 0) console.warn(`Could not end process ${sharedBrowser.processId}, which may already have ended`);
  rmSync(SHARED_BROWSER_PATH, { force: true });
  console.log(`Stopped the shared browser at ${sharedBrowser.wsEndpoint}`);
};
