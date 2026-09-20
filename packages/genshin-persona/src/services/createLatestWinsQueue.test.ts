import { VoiceStatus } from "#src/models/VoiceStatus";
import { createLatestWinsQueue } from "#src/services/createLatestWinsQueue";
import { describe, expect, test, vi } from "vitest";

describe(createLatestWinsQueue, () => {
  test("runs the newest pending item once the running one ends, and supersedes the rest", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = vi.fn<(item: number) => Promise<VoiceStatus>>((item) =>
      item === 0 ? firstRun : Promise.resolve(VoiceStatus.Ok),
    );
    const push = createLatestWinsQueue(run);
    const first = push(0);
    const second = push(1);
    const third = push(2);

    await expect(second).resolves.toBe(VoiceStatus.Superseded);

    endFirstRun(VoiceStatus.Ok);

    await expect(first).resolves.toBe(VoiceStatus.Ok);
    await expect(third).resolves.toBe(VoiceStatus.Ok);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenNthCalledWith(2, 2);
  });
});
