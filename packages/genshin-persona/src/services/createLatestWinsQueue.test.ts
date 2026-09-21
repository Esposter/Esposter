import { VoiceStatus } from "#src/models/VoiceStatus";
import { createLatestWinsQueue } from "#src/services/createLatestWinsQueue";
import { describe, expect, test, vi } from "vitest";

const getRun = (firstRun: Promise<VoiceStatus>) =>
  vi.fn<(item: number, checkIsSuperseded: () => boolean) => Promise<VoiceStatus>>((item) =>
    item === 0 ? firstRun : Promise.resolve(VoiceStatus.Ok),
  );

describe(createLatestWinsQueue, () => {
  test("runs the newest pending item once the running one ends, and supersedes the rest", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(0);
    const second = push(1);
    const third = push(2);

    await expect(second).resolves.toBe(VoiceStatus.Superseded);

    endFirstRun(VoiceStatus.Ok);

    await expect(first).resolves.toBe(VoiceStatus.Ok);
    await expect(third).resolves.toBe(VoiceStatus.Ok);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[1]?.[0]).toBe(2);
  });

  test("tells the item already running that a newer one is waiting on it", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(0);
    const checkIsSuperseded = run.mock.calls[0]?.[1];

    expect(checkIsSuperseded?.()).toBe(false);

    const second = push(1);

    expect(checkIsSuperseded?.()).toBe(true);

    endFirstRun(VoiceStatus.Superseded);

    await expect(first).resolves.toBe(VoiceStatus.Superseded);
    await expect(second).resolves.toBe(VoiceStatus.Ok);
  });
});
