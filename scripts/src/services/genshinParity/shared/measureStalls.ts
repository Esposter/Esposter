/* oxlint-disable no-underscore-dangle -- the names are the page's own globals: the window fields the page keeps and the devtools messenger three publishes */

import type { DevtoolsMessage } from "#src/models/genshinParity/shared/DevtoolsMessage";
import type { FrameSample } from "#src/models/genshinParity/shared/FrameSample";
import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";
import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";
import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";
import type { StallOptions } from "#src/models/genshinParity/shared/StallOptions";
import type { StallRenderer } from "#src/models/genshinParity/shared/StallRenderer";

import { STALLS_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { resolveParityPageRoot } from "#src/services/genshinParity/shared/resolveParityPageRoot";
import { hookRenderer } from "#src/services/genshinParity/shared/hookRenderer";
import { measureSceneKinds } from "#src/services/genshinParity/shared/measureSceneKinds";
import { measureStates } from "#src/services/genshinParity/shared/measureStates";
import { startCpuProfile } from "#src/services/genshinParity/shared/startCpuProfile";
import { summarizeGpuTrace } from "#src/services/genshinParity/shared/summarizeGpuTrace";
import { TRACE_GPU_PASSES_SCRIPT } from "#src/services/genshinParity/shared/traceGpuPassesScript";
import { TRACE_GPU_SCRIPT } from "#src/services/genshinParity/shared/traceGpuScript";
import { TRACE_NODES_SCRIPT } from "#src/services/genshinParity/shared/traceNodesScript";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

declare global {
  interface Window {
    __fakeLock: boolean;
    __frameTimes: FrameSample[];
    __gpuCalls?: GpuCall[];
    __gpuPasses?: GpuPass[];
    __hasGpuTimestamps?: boolean;
    __hooked: boolean;
    __renderer?: StallRenderer;
    __scene?: unknown;
    __traceTimes?: number[];
    __TRES__DEVTOOLS__?: { subscribers: Set<(message: DevtoolsMessage) => void> };
  }
}

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

// Opens the screen on the parity page at a viewport and device ratio, runs the orbit and walk states, prints a row a state,
// And writes the run beside the rest of the parity tool's output. Its page is the one `genshin:parity` serves. With a trace,
// Each GPU call the page makes is recorded too, with each node material three builds and each program it adds once the
// Renderer is handed over, and each pass timed on the GPU where the adapter has timestamp queries, read at full
// Precision through the browser's developer features, and the slow frames are named by the calls they made and the
// GPU's time on the frames before them. Once the walk has ended, the camera still, each kind of the scene's objects is
// Hidden in turn, which the passes' times price each kind by
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

    const pageRoot = await resolveParityPageRoot();
    const loadStart = Date.now();
    await page.goto(`${pageRoot}?screen=${screen}`, { waitUntil: "networkidle" });
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
    const kinds = trace ? await measureSceneKinds(page) : undefined;
    const tracedGpu: GpuTrace | undefined = trace
      ? {
          ...(await page.evaluate(() => ({
            calls: window.__gpuCalls ?? [],
            passes: window.__hasGpuTimestamps ? (window.__gpuPasses ?? []) : undefined,
            times: window.__traceTimes ?? [],
          }))),
          cpu: cpuCapture,
          kinds,
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
