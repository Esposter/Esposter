import type { CpuCapture } from "#src/models/genshinParity/shared/CpuCapture";

import { summarizeCpuWindow } from "#src/services/genshinParity/shared/summarizeCpuWindow";
import { describe, expect, test } from "vitest";

describe(summarizeCpuWindow, () => {
  const START_US = 1_000_000;
  const SAMPLE_US = 1000;
  const CAPTURE: CpuCapture = {
    nodes: [
      { callFrame: { functionName: "buildMaterial", lineNumber: 3, url: "deps/three_webgpu.js" }, id: 1 },
      { callFrame: { functionName: "createCommandEncoder", lineNumber: -1, url: "" }, id: 2 },
    ],
    offsetMs: 0,
    samples: [1, 2, 2],
    startTime: START_US,
    timeDeltas: [SAMPLE_US, SAMPLE_US, SAMPLE_US],
  };

  test("names the functions the samples inside the window held, by their count", () => {
    expect.hasAssertions();

    const WINDOW_START_MS = 1001.5;
    const WINDOW_END_MS = 1003;

    expect(summarizeCpuWindow(CAPTURE, WINDOW_START_MS, WINDOW_END_MS)).toStrictEqual([
      "  cpu 2 of 2 samples in createCommandEncoder native",
    ]);
  });

  test("reads nothing from a window no sample falls in", () => {
    expect.hasAssertions();

    expect(summarizeCpuWindow(CAPTURE, 0, 1)).toStrictEqual([]);
  });
});
