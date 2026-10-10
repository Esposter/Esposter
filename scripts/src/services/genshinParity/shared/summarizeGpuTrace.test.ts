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
    ],
    times: TIMES,
  };
  const STATES: TracedState[] = [{ frames: TIMES.map((time) => ({ programs: null, time })), name: "walk 20 s" }];

  test("names a slow frame by the causes of the calls it made", () => {
    expect.hasAssertions();

    expect(summarizeGpuTrace(TRACE, STATES)).toStrictEqual([
      "walk 20 s: 2 GPU calls started in its frames, pipelines 1 (12 ms), buffers 1 (1 ms)",
      "walk 20 s: 1 frame(s) traced",
      `frame #1 at ${FRAME_MS} ms: ${SLOW_FRAME_MS} ms, 2 GPU calls for ${PIPELINE_MS + 1} ms`,
      "  pipelines 1 (12 ms), buffers 1 (1 ms)",
      `  ${PIPELINE_MS} ms createRenderPipeline | terrain | entry main`,
      "  1 ms writeBuffer |  | 4096 B",
    ]);
  });
});
