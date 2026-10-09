import type { GpuTrace } from "#src/models/genshinParity/shared/GpuTrace";
import type { TracedState } from "#src/models/genshinParity/shared/TracedState";

import { summarizeGpuTrace } from "#src/services/genshinParity/shared/summarizeGpuTrace";
import { describe, expect, test } from "vitest";

describe(summarizeGpuTrace, () => {
  const FRAME_MS = 16;
  const SLOW_FRAME_MS = 60;
  const TIMES = [0, FRAME_MS, FRAME_MS + SLOW_FRAME_MS];
  const PIPELINE_MS = 12;
  const TRACE: GpuTrace = {
    calls: [
      {
        detail: "entry main",
        duration: PIPELINE_MS,
        frame: 1,
        label: "terrain",
        name: "createRenderPipeline",
        start: 0,
      },
      { detail: "4096 B", duration: 1, frame: 1, label: "", name: "writeBuffer", start: 0 },
      {
        detail: "Mesh unnamed 3 vertices",
        duration: 1,
        frame: 1,
        label: "MeshToonNodeMaterial",
        name: "buildNodes",
        start: 0,
      },
      { detail: "", duration: 0, frame: 1, label: "fragment", name: "createProgram", start: 0 },
    ],
    times: TIMES,
  };
  const STATES: TracedState[] = [{ frames: TIMES.map((time) => ({ programs: null, time })), name: "walk 20 s" }];

  test("names a slow frame by the causes of the calls it made", () => {
    expect.hasAssertions();

    expect(summarizeGpuTrace(TRACE, STATES)).toStrictEqual([
      "the adapter has no timestamp queries, so no pass is timed on the GPU",
      "walk 20 s: 4 traced calls started in its frames, pipelines 1 (12 ms), buffers 1 (1 ms), node builds 1 (1 ms), programs 1 (0 ms)",
      "  built 1x for 1 ms: MeshToonNodeMaterial | Mesh unnamed 3 vertices",
      "walk 20 s: 1 frame(s) traced",
      `frame #1 at ${FRAME_MS} ms: ${SLOW_FRAME_MS} ms, 4 traced calls for ${PIPELINE_MS + 2} ms`,
      "  pipelines 1 (12 ms), buffers 1 (1 ms), node builds 1 (1 ms), programs 1 (0 ms)",
      `  ${PIPELINE_MS} ms createRenderPipeline | terrain | entry main`,
      "  1 ms writeBuffer |  | 4096 B",
      "  1 ms buildNodes | MeshToonNodeMaterial | Mesh unnamed 3 vertices",
    ]);
  });

  test("names a slow frame by the GPU's time on its passes and the frames before it", () => {
    expect.hasAssertions();

    const SHADOW_PASS = "renderContext_2 | depth only, shadow 2048x2048 depth24plus";
    const VIEW_PASS = "renderContext_1 | 1 colour, output 1600x900 rgba16float";
    const traceWithPasses: GpuTrace = {
      calls: [],
      passes: [
        {
          beginMs: 100,
          detail: "1 colour, output 1600x900 rgba16float",
          frame: 0,
          gpuMs: 2,
          label: "renderContext_1",
          submittedMs: 0,
        },
        {
          beginMs: 146,
          detail: "depth only, shadow 2048x2048 depth24plus",
          frame: 1,
          gpuMs: 8,
          label: "renderContext_2",
          submittedMs: FRAME_MS,
        },
      ],
      times: TIMES,
    };

    expect(summarizeGpuTrace(traceWithPasses, STATES)).toStrictEqual([
      "walk 20 s: 0 traced calls started in its frames, none",
      "  gpu 2 passes timed, 5 ms a frame at the median and 8 at most, begun 15 ms after their submit at the median and 30 at most",
      `  gpu 1x for 8 ms, at most 8 ms: ${SHADOW_PASS}`,
      `  gpu 1x for 2 ms, at most 2 ms: ${VIEW_PASS}`,
      "walk 20 s: 1 frame(s) traced",
      `frame #1 at ${FRAME_MS} ms: ${SLOW_FRAME_MS} ms, 0 traced calls for 0 ms`,
      "  no traced calls",
      `  gpu frame #0: 2 ms in 1 passes, begun up to 0 ms after submit, heaviest 2 ms ${VIEW_PASS}`,
      `  gpu frame #1: 8 ms in 1 passes, begun up to 30 ms after submit, heaviest 8 ms ${SHADOW_PASS}`,
    ]);
  });
});
