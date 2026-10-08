import type { SharedBrowser } from "#src/models/genshinParity/shared/SharedBrowser";

import {
  PARITY_ENTRY_PATH,
  SCRIPTS_DIRECTORY,
  SHARED_BROWSER_PATH,
  SHARED_BROWSER_POLL_MS,
  SHARED_BROWSER_START_TIMEOUT_MS,
} from "#src/services/genshinParity/shared/constants";
import { connectSharedBrowser } from "#src/services/genshinParity/shared/connectSharedBrowser";
import { readSharedBrowser } from "#src/services/genshinParity/shared/readSharedBrowser";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { setTimeout } from "node:timers/promises";

// Starts the shared browser in a process detached from this one, so it outlives the command, and returns once it has
// Written its address. A browser already answering is left as it is
export const startSharedBrowser = async (): Promise<void> => {
  const sharedBrowser = readSharedBrowser();
  const running = await connectSharedBrowser(sharedBrowser);
  if (running) {
    await running.close();
    console.log(`A shared browser is already serving at ${sharedBrowser?.wsEndpoint}`);
    return;
  }
  // A file a dead browser left would be read below as the new one's address, before it has written its own
  rmSync(SHARED_BROWSER_PATH, { force: true });
  // PowerShell starts the server without redirecting its output: a redirect would hand it this command's pipes, which
  // Would stay open until its Edge closed and hang whatever waits on `browser start`. A failure to start shows when
  // `browser serve` runs in the foreground
  const script = `Start-Process -FilePath '${process.execPath}' -ArgumentList '--import','tsx','${PARITY_ENTRY_PATH}','browser','serve' -WorkingDirectory '${SCRIPTS_DIRECTORY}' -WindowStyle Hidden`;
  spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")],
    { stdio: "ignore", windowsHide: true },
  );
  const deadline = Date.now() + SHARED_BROWSER_START_TIMEOUT_MS;
  let written: SharedBrowser | undefined = readSharedBrowser();
  while (!written) {
    if (Date.now() > deadline)
      throw new InvalidOperationError(
        Operation.Read,
        SHARED_BROWSER_PATH,
        "not written: run `genshin:parity browser serve` in the foreground to see why",
      );
    // oxlint-disable-next-line no-await-in-loop -- the address is read after each poll of the file
    await setTimeout(SHARED_BROWSER_POLL_MS);
    written = readSharedBrowser();
  }
  console.log(`The shared browser is serving at ${written.wsEndpoint}`);
};
