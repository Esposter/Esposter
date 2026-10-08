import { SHARED_BROWSER_PATH } from "#src/services/genshinParity/shared/constants";
import { rmSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

// The one Edge every parity command opens its pages in, launched here and served on a socket, with this process's id
// And the address beside it written where a command reads it. It serves until its Edge exits, and `browser stop` ends
// This process and that Edge together
export const serveSharedBrowser = async (): Promise<void> => {
  const server = await chromium.launchServer({ channel: "msedge" });
  writeFileSync(SHARED_BROWSER_PATH, JSON.stringify({ processId: process.pid, wsEndpoint: server.wsEndpoint() }));
  await new Promise<void>((resolve) => {
    server.process().once("exit", () => {
      resolve();
    });
  });
  rmSync(SHARED_BROWSER_PATH, { force: true });
};
