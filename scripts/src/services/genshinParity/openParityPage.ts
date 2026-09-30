import type { ParityPageOptions } from "#src/models/genshinParity/ParityPageOptions";
import type { Browser, Page } from "playwright";

import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import {
  INTERFACE_HEIGHT,
  PARITY_BACKDROP_FILE,
  PARITY_PAGE_URL,
  WITNESS_LAYOUT_PATH,
  WITNESS_PATH_PREFIX,
} from "#src/services/genshinParity/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import { chromium } from "playwright";

// The parity page on one screen in the machine's own Edge, at the game's interface height and the reference's aspect,
// Drawn at the reference's pixel size, once it has drawn. A backdrop is served to the page under the name its query
// Gives, which it draws behind the screen, and a witness's exports under `WITNESS_PATH_PREFIX`: its layout, which the
// Query names, and its meshes and textures by their export folders. The caller closes the browser
export const openParityPage = async ({
  backdropPath,
  height,
  motion,
  props,
  screen,
  width,
  witness,
}: ParityPageOptions): Promise<{ browser: Browser; page: Page }> => {
  const browser = await chromium.launch({ channel: "msedge" });
  const deviceScaleFactor = height / INTERFACE_HEIGHT;
  const page = await browser.newPage({
    deviceScaleFactor,
    viewport: { height: INTERFACE_HEIGHT, width: Math.round(width / deviceScaleFactor) },
  });
  const motionQuery = motion ? `&motion=${motion}` : "";
  const propsQuery = props ? `&props=${encodeURIComponent(JSON.stringify(props))}` : "";
  const backdropQuery = backdropPath ? `&backdrop=${PARITY_BACKDROP_FILE}` : "";
  if (backdropPath) await page.route(`**/${PARITY_BACKDROP_FILE}`, (route) => route.fulfill({ path: backdropPath }));
  const witnessQuery = witness ? `&witness=${encodeURIComponent(`${WITNESS_PATH_PREFIX}${WITNESS_LAYOUT_PATH}`)}` : "";
  if (witness) {
    const { assets, root } = getComponentDirectory(witness);
    await page.route(`**${WITNESS_PATH_PREFIX}**`, (route) => {
      const path = decodeURIComponent(new URL(route.request().url()).pathname.slice(WITNESS_PATH_PREFIX.length));
      return route.fulfill({ path: path === WITNESS_LAYOUT_PATH ? join(root, "witness.json") : join(assets, path) });
    });
  }
  await page.goto(`${PARITY_PAGE_URL}${screen}${motionQuery}${propsQuery}${backdropQuery}${witnessQuery}`, {
    waitUntil: "networkidle",
  });
  const readyScreen = await page.locator("[data-parity-ready]").getAttribute("data-parity-ready");
  // An unknown name draws the list of screens, which would otherwise be shot and scored as the screen
  if (readyScreen !== screen) {
    await browser.close();
    throw new InvalidOperationError(Operation.Read, screen, "not a screen with a fixture on the parity page");
  }
  return { browser, page };
};
