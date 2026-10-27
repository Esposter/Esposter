import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";
import type { ConsoleMessage, Page } from "playwright";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import {
  DEVICE_SCALE_MARGIN,
  INTERFACE_HEIGHT,
  PARITY_BACKDROP_FILE,
  PARITY_FRAME_MS,
  PARITY_READY_TIMEOUT_MS,
  RESOURCE_TIMING_BUFFER_SIZE,
  WITNESS_LAYOUT_PATH,
  WITNESS_PATH_PREFIX,
} from "#src/services/genshinParity/shared/constants";
import { resolveParityPageRoot } from "#src/services/genshinParity/shared/resolveParityPageRoot";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

// A console error printed with its first argument's message, and the URL of a resource that failed to load, since the
// Page's text names only the error's class: a ZodError's issues are its message
const reportConsoleError = (message: ConsoleMessage): Promise<void> =>
  getResultAsync(async () => {
    const [firstArgument] = message.args();
    const detail = firstArgument
      ? await firstArgument.evaluate((value) => (value instanceof Error ? value.message : String(value)))
      : message.text();
    console.error(`parity page: ${detail} ${message.location().url}`);
  }).match(noop, noop);

// The parity page on one screen, at the game's interface height and the reference's aspect, drawn at the reference's pixel
// Size, once it has drawn. It launches its own Edge, with the flags an unlimited frame rate needs, and closes it with the page.
// A backdrop is served to the page under the name its query gives, which it draws behind the screen, and a witness's exports
// Under `WITNESS_PATH_PREFIX`: its layout, which the query names with the component whose claims the page reads, and its
// Meshes and textures by their export folders. The caller closes the page with `close`, which closes its context and the
// Browser
export const openParityPage = async ({
  backdropPath,
  height,
  isClockFaked,
  isFrameRateUnlimited,
  motion,
  pageRoot,
  props,
  screen,
  width,
  witness,
}: ParityPageOptions): Promise<{ close: () => Promise<void>; page: Page }> => {
  // Unlimited, a frame is drawn as soon as the last is, so a frame's time is what drawing it costs rather than the
  // Display's refresh
  const browser = await chromium.launch({
    args: isFrameRateUnlimited ? ["--disable-gpu-vsync", "--disable-frame-rate-limit"] : [],
    channel: "msedge",
  });
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
  const close = async (): Promise<void> => {
    await context.close();
    await browser.close();
  };
  // A failure once the page is open closes it, since no caller receives it to close
  const missingFiles: string[] = [];
  return getResultAsync(async () => {
    const page = await context.newPage();
    // A page error is printed as it happens, so a failure the screen logs and carries on past reaches the terminal too
    page.on("pageerror", (error) => console.error(`parity page: ${String(error)}`));
    page.on("console", (message) => {
      // oxlint-disable-next-line typescript/no-floating-promises -- the report's own result is an error it has already printed
      if (message.type() === "error") reportConsoleError(message);
    });
    await page.addInitScript((size) => performance.setResourceTimingBufferSize(size), RESOURCE_TIMING_BUFFER_SIZE);
    const motionQuery = motion ? `&motion=${motion}` : "";
    const propsQuery = props ? `&props=${encodeURIComponent(JSON.stringify(props))}` : "";
    const backdropQuery = backdropPath ? `&backdrop=${PARITY_BACKDROP_FILE}` : "";
    if (backdropPath) await page.route(`**/${PARITY_BACKDROP_FILE}`, (route) => route.fulfill({ path: backdropPath }));
    const witnessQuery = witness
      ? `&witness=${encodeURIComponent(`${WITNESS_PATH_PREFIX}${WITNESS_LAYOUT_PATH}`)}&witnessComponent=${witness}`
      : "";
    if (witness) {
      const { assets, root } = getComponentDirectory(witness);
      await page.route(`**${WITNESS_PATH_PREFIX}**`, (route) => {
        const path = decodeURIComponent(new URL(route.request().url()).pathname.slice(WITNESS_PATH_PREFIX.length));
        const filePath = path === WITNESS_LAYOUT_PATH ? join(root, WITNESS_LAYOUT_FILE_NAME) : join(assets, path);
        // An export not on disk is answered as missing: the page fails loading it, and whatever failure follows is thrown
        // With the path. Fulfilling from a file that is not there would reject inside this handler, where nothing awaits it
        if (!existsSync(filePath)) {
          missingFiles.push(filePath);
          return route.fulfill({ status: 404 });
        }
        return route.fulfill({ path: filePath });
      });
    }
    // A faked clock runs only as far as the caller moves it, frame by frame, so a motion is shot at exact moments
    if (isClockFaked) await page.clock.install({ time: 0 });
    const pageUrl = pageRoot ?? (await resolveParityPageRoot());
    // Opened at its load event rather than once idle, so a fetch the page issues after ready is not in the readings a
    // Caller takes at the ready signal
    await page.goto(`${pageUrl}?screen=${screen}${motionQuery}${propsQuery}${backdropQuery}${witnessQuery}`);
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
    if (parityError !== undefined) throw new InvalidOperationError(Operation.Read, screen, parityError);
    // An unknown name draws the list of screens, which would otherwise be shot and scored as the screen
    if (readyScreen !== screen)
      throw new InvalidOperationError(Operation.Read, screen, "not a screen with a fixture on the parity page");
    return { close, page };
  }).match(
    (value) => value,
    async (error) => {
      // The browser alone, which closes its context: a browser that has died with the page (its connection dropped
      // Under a load) has no context left to close, and closing one would throw over the failure that killed it
      await browser.close();
      // A missing export can fail the page in any way, an error the page reports or a readiness that never comes, so
      // Whatever failed it names the first export that was not on disk
      const [missingFile] = missingFiles;
      if (missingFile !== undefined) error.message = `${error.message}, its export ${missingFile} is not on disk`;
      throw error;
    },
  );
};
