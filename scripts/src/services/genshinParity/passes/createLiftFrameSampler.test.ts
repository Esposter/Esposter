import type { LiftFrame } from "#src/models/genshinParity/passes/LiftFrame";
import type { LiftFrameSource } from "#src/models/genshinParity/passes/LiftFrameSource";

import { createLiftFrameSampler } from "#src/services/genshinParity/passes/createLiftFrameSampler";
import { PARITY_FRAME_MS } from "#src/services/genshinParity/shared/constants";
import { describe, expect, test } from "vitest";

const turnEventLoop = (turns: number): Promise<void> =>
  Array.from({ length: turns }).reduce<Promise<void>>(async (previous) => {
    await previous;
    await Promise.resolve();
  }, Promise.resolve());

describe(createLiftFrameSampler, () => {
  // The page draws a frame every 16 milliseconds of its clock, and its clock moves only as the sampler advances it. A
  // Slow page draws each frame after `drawHops` turns of the event loop, a fast one at once: the frames it draws are
  // The same either way
  const TICK_MS = 16;
  const SAMPLE_COUNT = 5;
  const createPage = (drawHops: number): LiftFrameSource => {
    let clock = 0;
    let ticked = 0;
    let pending: number[] = [];
    const drawn: number[] = [];
    return {
      advance: (ms) => {
        clock += ms;
        const reached = Math.floor(clock / TICK_MS) * TICK_MS;
        for (; ticked < reached; ticked += TICK_MS) pending.push(ticked + TICK_MS);
        return Promise.resolve();
      },
      readFrame: async () => {
        const queued = pending;
        pending = [];
        await queued.reduce(async (previous, tick) => {
          await previous;
          await turnEventLoop(drawHops);
          drawn.push(tick);
        }, Promise.resolve());
        const time = drawn.at(-1) ?? 0;
        return { pieces: [[time]], time };
      },
    };
  };
  const readSamples = async (source: LiftFrameSource): Promise<LiftFrame[]> => {
    const sample = createLiftFrameSampler(source, PARITY_FRAME_MS);
    return Array.from({ length: SAMPLE_COUNT }).reduce<Promise<LiftFrame[]>>(
      async (previous) => [...(await previous), await sample()],
      Promise.resolve([]),
    );
  };

  test("a slow-drawing page and a fast one yield the same sampled frames", async () => {
    expect.hasAssertions();
    const fast = await readSamples(createPage(0));
    const slow = await readSamples(createPage(3));
    expect(slow).toStrictEqual(fast);
    expect(fast.map(({ time }) => time)).toStrictEqual([16, 32, 48, 64, 80]);
  });
});
