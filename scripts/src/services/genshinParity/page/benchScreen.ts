import type { SceneBench } from "#src/models/genshinParity/page/SceneBench";
import type { ParityPageOptions } from "#src/models/genshinParity/shared/ParityPageOptions";

import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";

// The share of the frames read off their sorted times
const getQuantile = (sorted: readonly number[], share: number): number =>
  sorted[Math.min(Math.floor(sorted.length * share), sorted.length - 1)] ?? 0;
// A scene's cost on the parity page, warmed until its pipelines have compiled: its frame time's median, its slow
// Tenth's and its slowest, against the main thread's busy time a frame, which tells a scene held up on the CPU from one
// Held up on the GPU; then the renderer's passes, draw calls and triangles a frame, and the pipelines, geometries and
// Textures it keeps, which a second bench of a leaking scene reads higher, and the objects drawn by kind
export const benchScreen = async ({
  frameCount,
  warmMs,
  ...options
}: ParityPageOptions & { frameCount: number; warmMs: number }): Promise<SceneBench> => {
  const { browser, page } = await openParityPage({ ...options, isFrameRateUnlimited: true });
  return withFinalizerAsync(
    async () => {
      await page.waitForTimeout(warmMs);
      const session = await page.context().newCDPSession(page);
      await session.send("Performance.enable");
      const readTaskSeconds = async (): Promise<number> => {
        const { metrics } = await session.send("Performance.getMetrics");
        return metrics.find(({ name }) => name === "TaskDuration")?.value ?? 0;
      };
      const startTaskSeconds = await readTaskSeconds();
      const bench = await page.evaluate(
        (count) => (Reflect.get(window, "benchScene") as (frameCount: number) => Promise<SceneBench>)(count),
        frameCount,
      );
      const taskMs = ((await readTaskSeconds()) - startTaskSeconds) * 1000;
      const sorted = bench.intervals.toSorted((firstInterval, secondInterval) => firstInterval - secondInterval);
      const median = getQuantile(sorted, 0.5);
      console.log(
        `frame ${median.toFixed(1)} ms median (${(1000 / median).toFixed(0)} fps), ${getQuantile(sorted, 0.9).toFixed(1)} slowest tenth, ${(sorted.at(-1) ?? 0).toFixed(1)} slowest`,
      );
      console.log(`main thread ${(taskMs / frameCount).toFixed(1)} ms busy a frame`);
      console.log(
        `${bench.frameCalls.toFixed(0)} passes, ${bench.drawCalls.toFixed(0)} draw calls, ${(bench.triangles / 1000).toFixed(0)}k triangles a frame`,
      );
      console.log(
        Object.entries(bench.kindCounts)
          .toSorted(([, first], [, second]) => second - first)
          .map(([kind, count]) => `${count} ${kind}`)
          .join(", "),
      );
      console.log(`${bench.programs} pipelines, ${bench.geometries} geometries, ${bench.textures} textures kept`);
      return bench;
    },
    () => browser.close(),
  );
};
