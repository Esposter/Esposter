/* oxlint-disable no-underscore-dangle -- the names are the page's own globals: the window fields the page keeps and the devtools messenger three publishes */
import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";
import type { FrameSample } from "#src/models/genshinParity/shared/FrameSample";
import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";
import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";
import type { StallOptions } from "#src/models/genshinParity/shared/StallOptions";
import type { StallState } from "#src/models/genshinParity/shared/StallState";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";
import type { BrowserContext, Page } from "playwright";

import { PARITY_PAGE_URL, STALLS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { summarizeGpuTrace } from "#src/services/genshinParity/shared/summarizeGpuTrace";
import { summarizeStallState } from "#src/services/genshinParity/shared/summarizeStallState";
import { TRACE_GPU_PASSES_SCRIPT } from "#src/services/genshinParity/shared/traceGpuPassesScript";
import { TRACE_GPU_SCRIPT } from "#src/services/genshinParity/shared/traceGpuScript";
import { TRACE_NODES_SCRIPT } from "#src/services/genshinParity/shared/traceNodesScript";
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
    __gpuCalls?: GpuCall[];
    __gpuPasses?: GpuPass[];
    __hasGpuTimestamps?: boolean;
    __hooked: boolean;
    __renderer?: StallRenderer;
    __traceTimes?: number[];
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
const CPU_SAMPLE_MICROSECONDS = 200;
const MICROSECONDS_PER_MS = 1000;

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
const measureState = async (
  page: Page,
  name: string,
  drive: () => Promise<void>,
): Promise<TracedState & { state: StallState }> => {
  await page.evaluate(() => {
    window.__frameTimes = [];
  });
  const programsBefore = await readPrograms(page);
  await drive();
  const frames = await page.evaluate(() => window.__frameTimes);
  const programsAfter = await readPrograms(page);

  return { frames, name, state: summarizeStallState(name, frames, programsBefore, programsAfter) };
};

// The states of one run, in order: the cold orbit straight after load, where the first sight of each pipeline lands, then
// A second orbit, then a walk, each after a pause so one state's frames do not run into the next
const measureStates = async (page: Page): Promise<(TracedState & { state: StallState })[]> => {
  const coldOrbit = await measureState(page, "cold orbit", () => orbit(page, ORBIT_MS));
  await page.waitForTimeout(PAUSE_MS);
  const secondOrbit = await measureState(page, "second orbit", () => orbit(page, ORBIT_MS));
  await page.waitForTimeout(PAUSE_MS);
  const walked = await measureState(page, `walk ${WALK_MS / 1000} s`, () => walk(page, WALK_MS));

  return [coldOrbit, secondOrbit, walked];
};

// The page's main-thread samples over the run, which a slow frame with no GPU call in it is named by. The profile's clock is
// Read against the page's own clock at the start, so each sample's time is the frame times' time
const startCpuProfile = async (context: BrowserContext, page: Page) => {
  const session = await context.newCDPSession(page);
  await session.send("Profiler.enable");
  await session.send("Profiler.setSamplingInterval", { interval: CPU_SAMPLE_MICROSECONDS });
  const pageNowMs = await page.evaluate(() => performance.now());
  await session.send("Profiler.start");

  return {
    stop: async (): Promise<CpuCapture> => {
      const { profile } = await session.send("Profiler.stop");
      return {
        nodes: profile.nodes ?? [],
        offsetMs: profile.startTime / MICROSECONDS_PER_MS - pageNowMs,
        samples: profile.samples ?? [],
        startTime: profile.startTime,
        timeDeltas: profile.timeDeltas ?? [],
      };
    },
  };
};

// Opens the screen on the parity page at a viewport and device ratio, runs the orbit and walk states, prints a row a state,
// And writes the run beside the rest of the parity tool's output. Its page is the one `genshin:parity` serves. With a trace,
// Each GPU call the page makes is recorded too, with each node material three builds and each program it adds once the
// Renderer is handed over, and each pass timed on the GPU where the adapter has timestamp queries, read at full
// Precision through the browser's developer features, and the slow frames are named by the calls they made and the
// GPU's time on the frames before them
export const measureStalls = async ({ height, scale, screen, trace, width }: StallOptions): Promise<string> => {
  const browser = await chromium.launch({
    args: [
      "--disable-gpu-vsync",
      "--disable-frame-rate-limit",
      ...(trace ? ["--enable-webgpu-developer-features"] : []),
    ],
    channel: "msedge",
  });
  const errors: string[] = [];
  // The browser is closed whether the run measures or fails
  const { gpuTrace, loadMs, measured } = await getResultAsync(async () => {
    const context = await browser.newContext({ deviceScaleFactor: scale, viewport: { height, width } });
    await context.addInitScript({ content: RECORD_FRAMES_SCRIPT });
    if (trace) {
      await context.addInitScript({ content: TRACE_GPU_PASSES_SCRIPT });
      await context.addInitScript({ content: TRACE_GPU_SCRIPT });
    }

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
    if (trace) await page.evaluate(TRACE_NODES_SCRIPT);
    const cpu = trace ? await startCpuProfile(context, page) : undefined;
    const measuredStates = await measureStates(page);
    const cpuCapture = cpu ? await cpu.stop() : undefined;
    const tracedGpu: GpuTrace | undefined = trace
      ? {
          ...(await page.evaluate(() => ({
            calls: window.__gpuCalls ?? [],
            passes: window.__hasGpuTimestamps ? (window.__gpuPasses ?? []) : undefined,
            times: window.__traceTimes ?? [],
          }))),
          cpu: cpuCapture,
        }
      : undefined;
    return { gpuTrace: tracedGpu, loadMs: loadEnd - loadStart, measured: measuredStates };
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

  const states = measured.map(({ state }) => state);
  const label = `${screen} ${width}x${height} at scale ${scale}`;
  const rows = states.map(
    (state) =>
      `${state.name} | ${state.frames} | ${state.maxFrameMs} | ${state.over50} | ${state.over250} | ${state.programsBefore}->${state.programsAfter} | ${state.growthAt.map((growth) => `${growth.atMs}:${growth.programs}`).join(" ")}`,
  );
  const report = [
    `${label}, load ${loadMs} ms, ${errors.length} errors`,
    "state | frames | max ms | >50 | >250 | programs before->after | growth (ms:count)",
    ...rows,
  ];
  if (gpuTrace) report.push(...summarizeGpuTrace(gpuTrace, measured));
  await mkdir(STALLS_DIRECTORY, { recursive: true });
  const path = join(STALLS_DIRECTORY, `${screen}-${width}x${height}-scale${scale}${trace ? "-trace" : ""}.json`);
  await writeFile(path, JSON.stringify({ errors: errors.slice(0, 10), gpuTrace, label, loadMs, states }, null, 2));

  return `${report.join("\n")}\n${path}`;
};
