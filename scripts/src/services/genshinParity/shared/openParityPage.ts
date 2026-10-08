import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";
import type { Page } from "playwright";

import { WITNESS_LAYOUT_FILE_NAME } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { connectSharedBrowser } from "#src/services/genshinParity/shared/connectSharedBrowser";
import {
  DEVICE_SCALE_MARGIN,
  INTERFACE_HEIGHT,
  PARITY_BACKDROP_FILE,
  PARITY_FRAME_MS,
  PARITY_PAGE_URL,
  PARITY_READY_TIMEOUT_MS,
  WITNESS_LAYOUT_PATH,
  WITNESS_PATH_PREFIX,
} from "#src/services/genshinParity/shared/constants";
import { readSharedBrowser } from "#src/services/genshinParity/shared/readSharedBrowser";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

// The parity page on one screen, at the game's interface height and the reference's aspect, drawn at the reference's
// Pixel size, once it has drawn. It opens in its own context of the shared browser `genshin:parity browser start` holds,
// Or in an Edge of its own when none answers or its frame rate is unlimited, since a shared browser was not started with
// The flags an unlimited rate needs. A backdrop is served to the page under the name its query gives, which it draws
// Behind the screen, and a witness's exports under `WITNESS_PATH_PREFIX`: its layout, which the query names, and its
// Meshes and textures by their export folders. The caller closes the page with `close`, which closes its context, and
// The browser too where this page launched it
export const openParityPage = async ({
  backdropPath,
  height,
  isClockFaked,
  isFrameRateUnlimited,
  motion,
  props,
  screen,
  width,
  witness,
}: ParityPageOptions): Promise<{ close: () => Promise<void>; page: Page }> => {
  // A bench's frame rate needs the launch flags, which the shared browser was not started with
  const sharedBrowser = isFrameRateUnlimited ? undefined : await connectSharedBrowser(readSharedBrowser());
  // Unlimited, a frame is drawn as soon as the last is, so a frame's time is what drawing it costs rather than the
  // Display's refresh
  const browser =
    sharedBrowser ??
    (await chromium.launch({
      args: isFrameRateUnlimited ? ["--disable-gpu-vsync", "--disable-frame-rate-limit"] : [],
      channel: "msedge",
    }));
  // A canvas is drawn at its CSS size times the device's ratio, floored, and the browser holds that ratio in single
  // Precision, so the height over the interface's exactly can floor a row short: the ratio is lifted by a margin,
  // And the width is the least in CSS pixels whose drawn width is the one asked for, so a scene draws exactly the
  // Pixels a reference is resized to at any aspect
  const deviceScaleFactor = (height / INTERFACE_HEIGHT) * (1 + DEVICE_SCALE_MARGIN);
  // A context that fails to open closes the browser, since no caller receives it to close
  const context = await getResultAsync(() =>
    browser.newContext({
      deviceScaleFactor,
      viewport: { height: INTERFACE_HEIGHT, width: Math.ceil(width / deviceScaleFactor) },
    }),
  ).match(
    (value) => value,
    async (error) => {
      await browser.close();
      throw error;
    },
  );
  // Closing a connected browser only disconnects from it, which leaves the shared one serving the other commands
  const close = async (): Promise<void> => {
    await context.close();
    await browser.close();
  };
  // A failure once the page is open closes it, since no caller receives it to close
  const missingFiles: string[] = [];
  return getResultAsync(async () => {
    const page = await context.newPage();
    const motionQuery = motion ? `&motion=${motion}` : "";
    const propsQuery = props ? `&props=${encodeURIComponent(JSON.stringify(props))}` : "";
    const backdropQuery = backdropPath ? `&backdrop=${PARITY_BACKDROP_FILE}` : "";
    if (backdropPath) await page.route(`**/${PARITY_BACKDROP_FILE}`, (route) => route.fulfill({ path: backdropPath }));
    const witnessQuery = witness
      ? `&witness=${encodeURIComponent(`${WITNESS_PATH_PREFIX}${WITNESS_LAYOUT_PATH}`)}`
      : "";
    if (witness) {
      const { assets, root } = getComponentDirectory(witness);
      await page.route(`**${WITNESS_PATH_PREFIX}**`, (route) => {
        const path = decodeURIComponent(new URL(route.request().url()).pathname.slice(WITNESS_PATH_PREFIX.length));
        const filePath = path === WITNESS_LAYOUT_PATH ? join(root, WITNESS_LAYOUT_FILE_NAME) : join(assets, path);
        // An export not on disk is answered as missing: the page fails loading it, and the failure is thrown below with
        // The path. Fulfilling from a file that is not there would reject inside this handler, where nothing awaits it
        if (!existsSync(filePath)) {
          missingFiles.push(filePath);
          return route.fulfill({ status: 404 });
        }
        return route.fulfill({ path: filePath });
      });
    }
    // A faked clock runs only as far as the caller moves it, frame by frame, so a motion is shot at exact moments
    if (isClockFaked) await page.clock.install({ time: 0 });
    await page.goto(`${PARITY_PAGE_URL}${screen}${motionQuery}${propsQuery}${backdropQuery}${witnessQuery}`, {
      waitUntil: "networkidle",
    });
    // The page is drawn once it is ready, or never once a failure nothing caught has stopped it
    const readPageState = () =>
      page.evaluate(() => {
        const { parityError, parityReady } = window.document.body.dataset;
        return { parityError, parityReady };
      });
    if (!isClockFaked)
      await page
        .locator("body[data-parity-ready], body[data-parity-error]")
        .waitFor({ timeout: PARITY_READY_TIMEOUT_MS });
    let { parityError, parityReady: readyScreen } = await readPageState();
    while (parityError === undefined && readyScreen === undefined) {
      // oxlint-disable-next-line no-await-in-loop -- the page draws one frame after another until it is ready
      await page.clock.runFor(PARITY_FRAME_MS);
      // oxlint-disable-next-line no-await-in-loop -- read after the frame it drew
      ({ parityError, parityReady: readyScreen } = await readPageState());
    }
    if (parityError !== undefined) {
      const [missingFile] = missingFiles;
      throw new InvalidOperationError(
        Operation.Read,
        screen,
        missingFile === undefined ? parityError : `${parityError}, its export ${missingFile} is not on disk`,
      );
    }
    // An unknown name draws the list of screens, which would otherwise be shot and scored as the screen
    if (readyScreen !== screen)
      throw new InvalidOperationError(Operation.Read, screen, "not a screen with a fixture on the parity page");
    return { close, page };
  }).match(
    (value) => value,
    async (error) => {
      await close();
      throw error;
    },
  );
};
