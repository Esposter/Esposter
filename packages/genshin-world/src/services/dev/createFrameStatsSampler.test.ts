import { FRAME_STATS_HISTORY_LENGTH } from "#src/services/dev/constants";
import { createFrameStatsSampler } from "#src/services/dev/createFrameStatsSampler";
import { describe, expect, test } from "vitest";

describe(createFrameStatsSampler, () => {
  test("overlay shows the counters", () => {
    expect.hasAssertions();

    const sampler = createFrameStatsSampler();
    const info = { render: { calls: 42, triangles: 1000 } };
    const frameTimes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const beforeTenth = frameTimes.map((frameTime) => sampler.sample(frameTime, info));

    expect({ beforeTenth, tenth: sampler.sample(10, info) }).toStrictEqual({
      beforeTenth: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
      tenth: { drawCalls: 42, frameMilliseconds: 5.5, triangles: 1000 },
    });
  });

  test("holds only the last frame times, so an older frame no longer moves the median", () => {
    expect.hasAssertions();

    const sampler = createFrameStatsSampler();
    const info = { render: { calls: 0, triangles: 0 } };
    for (let frame = 0; frame < 10; frame++) sampler.sample(1000, info);
    let latest;
    for (let frame = 0; frame < FRAME_STATS_HISTORY_LENGTH; frame++) latest = sampler.sample(10, info);

    expect(latest?.frameMilliseconds).toBe(10);
  });
});
