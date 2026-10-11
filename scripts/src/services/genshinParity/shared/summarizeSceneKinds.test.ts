import type { GpuPass } from "#src/models/genshinParity/shared/GpuPass";

import { summarizeSceneKinds } from "#src/services/genshinParity/shared/summarizeSceneKinds";
import { describe, expect, test } from "vitest";

describe(summarizeSceneKinds, () => {
  const FRAME_MS = 10;
  const TIMES = Array.from({ length: 11 }, (_value, index) => index * FRAME_MS);
  const VIEW_PASS = { detail: "2 colour", label: "renderContext_1" };
  const SHADOW_PASS = { detail: "depth only", label: "renderContext_2" };
  const toPass = (pass: typeof VIEW_PASS, frame: number, gpuMs: number): GpuPass => ({
    ...pass,
    beginMs: 0,
    frame,
    gpuMs,
    submittedMs: 0,
  });

  test("prices a kind on each pass by the time its hiding saved there against the ranges either side", () => {
    expect.hasAssertions();

    // The GPU slows over the run, the ranges with all drawn taking 4, 6 and 8, and a kind read against the ranges either
    // Side of it saves what its hiding saved, not the drift
    const passes = [
      ...[0, 1].map((frame) => toPass(VIEW_PASS, frame, 4)),
      ...[2, 3].map((frame) => toPass(VIEW_PASS, frame, 4)),
      ...[4, 5].map((frame) => toPass(VIEW_PASS, frame, 6)),
      ...[6, 7].map((frame) => toPass(VIEW_PASS, frame, 7)),
      ...[8, 9].map((frame) => toPass(VIEW_PASS, frame, 8)),
      toPass(SHADOW_PASS, 4, 2),
    ];

    expect(
      summarizeSceneKinds(passes, TIMES, {
        baselines: [
          { endFrame: 2, firstFrame: 0 },
          { endFrame: 6, firstFrame: 4 },
          { endFrame: 10, firstFrame: 8 },
        ],
        kinds: [
          { drawables: 1, endFrame: 4, firstFrame: 2, kind: "World/Grass" },
          { drawables: 2, endFrame: 8, firstFrame: 6, kind: "World/Water" },
        ],
      }),
    ).toStrictEqual([
      "kinds, camera still: 6.33 ms a frame on the GPU with every kind drawn (4 to 8 across its 3 ranges), at 100 frames a second",
      "  A 6 ms a frame, 1 passes a frame, 100 a second: renderContext_1 | 2 colour",
      "  B 0.33 ms a frame, 0.17 passes a frame, 17 a second: renderContext_2 | depth only",
      "kind | drawables | ms a frame saved | A | B",
      "World/Grass | 1 | 1.5 | 1 | 0.5",
      "World/Water | 2 | 0.5 | 0 | 0.5",
    ]);
  });
});
