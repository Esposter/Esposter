/* oxlint-disable no-underscore-dangle -- the names are the page's own globals: the window fields the page keeps and the devtools messenger three publishes */
import type { FrameSample } from "#src/models/genshinParity/shared/FrameSample";
import type { StallOptions } from "#src/models/genshinParity/shared/StallOptions";
import type { StallState } from "#src/models/genshinParity/shared/StallState";
import type { Page } from "playwright";

import { PARITY_PAGE_URL, STALLS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { summarizeStallState } from "#src/services/genshinParity/shared/summarizeStallState";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

interface DevtoolsMessage {
  data: { renderer: { instance?: StallRenderer; value?: { instance?: StallRenderer } } };
  type: string;
}

// The window fields the page keeps for the run: the frames it drew, the renderer it hands over and the pointer lock the orbit fakes
// The renderer as the run reads it: its program count is what grows as a pipeline first draws
interface StallRenderer {
  info: { memory: { programs: number } };
}

declare global {
  interface Window {
    __fakeLock: boolean;
    __frameTimes: FrameSample[];
    __hooked: boolean;
    __renderer?: StallRenderer;
    __TRES__DEVTOOLS__?: { subscribers: Set<(message: DevtoolsMessage) => void> };
  }
}

// Mouse look turns 0.002 radians a pixel, and a full turn is spread over six seconds of events every 16 milliseconds
const MOUSE_LOOK_RADIANS_PER_PIXEL = 0.002;
const ORBIT_EVENT_MS = 16;
const ORBIT_MS = 6000;
const ORBIT_MOUSE_PIXELS = (2 * Math.PI) / MOUSE_LOOK_RADIANS_PER_PIXEL;
const PAUSE_MS = 1000;
const WALK_MS = 20_000;
const LOAD_TIMEOUT_MS = 300_000;
const HOOK_TIMEOUT_MS = 60_000;

// Records every animation frame with the renderer's program count, from before the page's first frame. A script string rather
// Than a function: the TypeScript runner rewrites a named inner function with a helper the page does not have
const RECORD_FRAMES_SCRIPT = `
  window.__frameTimes = [];
  const tick = (time) => {
    window.__frameTimes.push({ programs: window.__renderer?.info.memory.programs ?? null, time });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__fakeLock = false;
  Object.defineProperty(Document.prototype, "pointerLockElement", {
    configurable: true,
    get() {
      return window.__fakeLock ? document.body : null;
    },
  });
`;

// Hands the renderer over as soon as the devtools messenger publishes its context, before the first frame it draws
const hookRenderer = () => {
  window.__hooked = false;
  window.__TRES__DEVTOOLS__?.subscribers.add((message) => {
    if (message.type !== "context" || window.__hooked) return;
    const holder = message.data.renderer;
    const renderer = holder.instance ?? holder.value?.instance;
    if (!renderer) return;
    window.__hooked = true;
    window.__renderer = renderer;
  });
};

const orbit = (page: Page, orbitDurationMs: number) =>
  page.evaluate(
    ({ durationMs, eventMs, mousePixels }) =>
      new Promise<void>((resolve) => {
        window.__fakeLock = true;
        const startMs = performance.now();
        let sentPixels = 0;
        // The browser truncates an event's movement to whole pixels, so each event sends the whole pixels the turn owes by
        // Its time, and a late timer neither truncates nor drops any of the turn
        const timer = setInterval(() => {
          const progress = Math.min((performance.now() - startMs) / durationMs, 1);
          const movementX = Math.round(mousePixels * progress) - sentPixels;
          sentPixels += movementX;
          window.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, movementX, movementY: 0 }));
          if (progress < 1) return;
          clearInterval(timer);
          window.__fakeLock = false;
          resolve();
        }, eventMs);
      }),
    { durationMs: orbitDurationMs, eventMs: ORBIT_EVENT_MS, mousePixels: ORBIT_MOUSE_PIXELS },
  );

const walk = async (page: Page, durationMs: number) => {
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: "KeyW", key: "w" })),
  );
  await page.waitForTimeout(durationMs);
  await page.evaluate(() =>
    window.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, code: "KeyW", key: "w" })),
  );
};

const readPrograms = (page: Page): Promise<null | number> =>
  page.evaluate(() => window.__renderer?.info.memory.programs ?? null);

// One state: the frames drawn while its drive runs, summarised with the programs held before and after it
const measureState = async (page: Page, name: string, drive: () => Promise<void>): Promise<StallState> => {
  await page.evaluate(() => {
    window.__frameTimes = [];
  });
  const programsBefore = await readPrograms(page);
  await drive();
  const frames = await page.evaluate(() => window.__frameTimes);
  const programsAfter = await readPrograms(page);

  return summarizeStallState(name, frames, programsBefore, programsAfter);
};

// The states of one run, in order: the cold orbit straight after load, where the first sight of each pipeline lands, then
// A second orbit, then a walk, each after a pause so one state's frames do not run into the next
const measureStates = async (page: Page): Promise<StallState[]> => {
  const coldOrbit = await measureState(page, "cold orbit", () => orbit(page, ORBIT_MS));
  await page.waitForTimeout(PAUSE_MS);
  const secondOrbit = await measureState(page, "second orbit", () => orbit(page, ORBIT_MS));
  await page.waitForTimeout(PAUSE_MS);
  const walked = await measureState(page, `walk ${WALK_MS / 1000} s`, () => walk(page, WALK_MS));

  return [coldOrbit, secondOrbit, walked];
};

// Opens the screen on the parity page at a viewport and device ratio, runs the orbit and walk states, prints a row a state,
// And writes the run beside the rest of the parity tool's output. Its page is the one `genshin:parity` serves
export const measureStalls = async ({ height, scale, screen, width }: StallOptions): Promise<string> => {
  const browser = await chromium.launch({
    args: ["--disable-gpu-vsync", "--disable-frame-rate-limit"],
    channel: "msedge",
  });
  const errors: string[] = [];
  // The browser is closed whether the run measures or fails
  const { loadMs, states } = await getResultAsync(async () => {
    const context = await browser.newContext({ deviceScaleFactor: scale, viewport: { height, width } });
    await context.addInitScript({ content: RECORD_FRAMES_SCRIPT });

    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const loadStart = Date.now();
    await page.goto(`${PARITY_PAGE_URL}${screen}`, { waitUntil: "networkidle" });
    await page.locator("body[data-parity-ready], body[data-parity-error]").waitFor({ timeout: LOAD_TIMEOUT_MS });
    const parityError = await page.evaluate(() => window.document.body.dataset.parityError);
    if (parityError) throw new InvalidOperationError(Operation.Read, screen, `page failed: ${parityError}`);
    const loadEnd = Date.now();
    await page.waitForFunction(() => window.__TRES__DEVTOOLS__ !== undefined, null, { timeout: HOOK_TIMEOUT_MS });
    await page.evaluate(hookRenderer);
    await page.waitForFunction(() => window.__hooked, null, { timeout: HOOK_TIMEOUT_MS });
    return { loadMs: loadEnd - loadStart, states: await measureStates(page) };
  }).match(
    async (value) => {
      await browser.close();
      return value;
    },
    async (error) => {
      await browser.close();
      throw error;
    },
  );

  const label = `${screen} ${width}x${height} at scale ${scale}`;
  const rows = states.map(
    (state) =>
      `${state.name} | ${state.frames} | ${state.maxFrameMs} | ${state.over50} | ${state.over250} | ${state.programsBefore}->${state.programsAfter} | ${state.growthAt.map((growth) => `${growth.atMs}:${growth.programs}`).join(" ")}`,
  );
  const report = [
    `${label}, load ${loadMs} ms, ${errors.length} errors`,
    "state | frames | max ms | >50 | >250 | programs before->after | growth (ms:count)",
    ...rows,
  ].join("\n");
  await mkdir(STALLS_DIRECTORY, { recursive: true });
  const path = join(STALLS_DIRECTORY, `${screen}-${width}x${height}-scale${scale}.json`);
  await writeFile(path, JSON.stringify({ errors: errors.slice(0, 10), label, loadMs, states }, null, 2));

  return `${report}\n${path}`;
};
