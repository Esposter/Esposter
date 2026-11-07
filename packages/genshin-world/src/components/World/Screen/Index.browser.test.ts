import { props } from "#src/components/World/Screen/Index.fixture";
import WorldScreen from "#src/components/World/Screen/Index.vue";
import liyueRegionJson from "#src/data/regions/liyue.json";
import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";
import { WINDRISE_START_MINUTES } from "#src/services/windrise/constants";
import { createPinia } from "pinia";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// Each pixel's luminance in the screenshot, from nought to one
const readLuminances = async (): Promise<number[]> => {
  const screenshot = await page.screenshot({ save: false });
  const response = await fetch(`data:image/png;base64,${screenshot}`);
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext("2d");
  if (!context) return [];
  context.drawImage(bitmap, 0, 0);
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const luminances: number[] = [];
  for (let index = 0; index < data.length; index += 4)
    luminances.push(((data[index] ?? 0) + (data[index + 1] ?? 0) + (data[index + 2] ?? 0)) / 3 / 255);
  return luminances;
};

// When the last of a load step's measures since a moment ended, or negative infinity while none has
const readLoadStepEnd = (name: string, since: number): number =>
  Math.max(
    ...performance
      .getEntriesByName(`${LOAD_STEP_MEASURE_PREFIX}${name}`, "measure")
      .filter(({ startTime }) => startTime >= since)
      .map(({ duration, startTime }) => startTime + duration),
  );

// Resolves once a load step has ended, counting only a step that began after a moment
const waitForLoadStep = (name: string, since: number): Promise<void> =>
  new Promise((resolve) => {
    const observer = new PerformanceObserver(() => {
      if (!Number.isFinite(readLoadStepEnd(name, since))) return;
      observer.disconnect();
      resolve();
    });
    observer.observe({ type: "measure" });
  });

const waitForFrames = async (frameCount: number): Promise<void> => {
  for (let frame = 0; frame < frameCount; frame++)
    // oxlint-disable-next-line no-await-in-loop -- each frame is waited on after the one before it
    await new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
};

describe("worldScreen", () => {
  // The world draws its first view in a headless browser slower than on a screen
  const timeoutMs = 60_000;
  // A second of frames, past what the ground of one view takes to stream in
  const settleFrameCount = 60;
  // Just inside Liyue's reach, toward its heart from the oak, so Liyue's region and its ground are read at the start
  const liyueReachPose = {
    fov: 45,
    heading: 56.9,
    pitch: -8,
    position: [-711.8, 192, -464.6] as [number, number, number],
  };
  // Past what the first view's ground takes to stream in here without a region's
  const holdMs = 15_000;

  test(
    "is ready once the ground of its first view has arrived and its frame holds still",
    async () => {
      expect.hasAssertions();

      // The page's full height, which the world fills.
      // In the body's flow its host is as tall as its content.
      // A canvas with no height of its own takes its 2:1 intrinsic ratio, leaving the page white under the world
      const host = document.createElement("div");
      host.style.height = "100vh";
      document.body.append(host);
      onTestFinished(() => {
        host.remove();
      });
      const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
      // The sky runs on in real time from the minute it is handed.
      // A slower load would read a later sky, a darker one at dusk.
      // Held at the first view's minute, the frame is the same on every machine
      await render(WorldScreen, {
        attrs: { onReady: resolveReady },
        container: host,
        global: { plugins: [createPinia()] },
        props: { ...props, heldMinutes: WINDRISE_START_MINUTES },
      });
      await ready;
      const readyLuminances = await readLuminances();
      await waitForFrames(settleFrameCount);
      const settledLuminances = await readLuminances();
      // The water under a ground still streaming in differs from the ground by far more than the clouds, the
      // Ripples and the grass move in a second
      const meanDifference =
        readyLuminances.reduce(
          (sum, luminance, index) => sum + Math.abs(luminance - (settledLuminances[index] ?? 0)),
          0,
        ) / readyLuminances.length;

      // No bound on the frame's darkest tones tells a veil from none: the pinned frame's darkest twentieth reads
      // Far lower on a Windows GPU than on this Mac's Metal, so a bound set between a veiled and an unveiled reading on
      // One machine passes a veiled frame on the other. The world draws neither god rays nor bloom by construction,
      // In its post chain

      expect(meanDifference).toBeLessThan(0.02);
    },
    timeoutMs,
  );

  test(
    "is ready paused, as it loads under the opening, drawing only the frames it asks for",
    async () => {
      expect.hasAssertions();

      const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
      await render(WorldScreen, {
        attrs: { onReady: resolveReady },
        global: { plugins: [createPinia()] },
        props: { ...props, isPaused: true },
      });

      await expect(ready).resolves.toBeUndefined();
    },
    timeoutMs,
  );

  test(
    "held screen reads its tables and mounts no session",
    async () => {
      expect.hasAssertions();

      const tablesRead = waitForLoadStep("world-gate", performance.now());
      await render(WorldScreen, {
        global: { plugins: [createPinia()] },
        props: { ...props, isHeld: true, isPaused: true },
      });
      await tablesRead;
      await waitForFrames(settleFrameCount);

      expect(document.querySelector("canvas")).toBeNull();
    },
    timeoutMs,
  );

  test(
    "released screen opens its session",
    async () => {
      expect.hasAssertions();

      const tablesRead = waitForLoadStep("world-gate", performance.now());
      const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
      const { rerender } = await render(WorldScreen, {
        attrs: { onReady: resolveReady },
        global: { plugins: [createPinia()] },
        props: { ...props, isHeld: true, isPaused: true },
      });
      await tablesRead;
      await rerender({ ...props, isHeld: false, isPaused: true });
      await ready;

      expect(document.querySelector("canvas")).not.toBeNull();
    },
    timeoutMs,
  );

  test(
    "is ready only once the grounds in reach of its start have arrived, however late",
    async () => {
      expect.hasAssertions();

      const since = performance.now();
      // Liyue's read is held until the terrain is ready without it, or until long after its first view would have been
      const { promise: terrainReady, resolve: resolveTerrainReady } = Promise.withResolvers<void>();
      const observer = new PerformanceObserver((list) => {
        if (list.getEntriesByName(`${LOAD_STEP_MEASURE_PREFIX}terrain`).length > 0) resolveTerrainReady();
      });
      observer.observe({ type: "measure" });
      const held = Promise.race([
        terrainReady,
        new Promise((resolve) => {
          setTimeout(resolve, holdMs);
        }),
      ]);
      const { fetch } = window;
      const fetchSpy = vi.spyOn(window, "fetch").mockImplementation(async (input, init) => {
        if (typeof input !== "string" || !input.endsWith("/liyue.json")) return fetch(input, init);
        await held;
        return Response.json(liyueRegionJson);
      });
      onTestFinished(() => {
        observer.disconnect();
        fetchSpy.mockRestore();
      });
      const { promise: ready, resolve: resolveReady } = Promise.withResolvers<void>();
      await render(WorldScreen, {
        attrs: { onReady: resolveReady },
        global: { plugins: [createPinia()] },
        props: { ...props, cameraPose: liyueReachPose },
      });
      await ready;

      expect(readLoadStepEnd("terrain", since)).toBeGreaterThanOrEqual(readLoadStepEnd("regions", since));
    },
    timeoutMs,
  );
});
