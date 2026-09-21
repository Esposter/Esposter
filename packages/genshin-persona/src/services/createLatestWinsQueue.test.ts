import { VoiceStatus } from "#src/models/VoiceStatus";
import { createLatestWinsQueue } from "#src/services/createLatestWinsQueue";
import { describe, expect, test, vi } from "vitest";

const getRun = (firstRun: Promise<VoiceStatus>) =>
  vi.fn<(item: number, readPending: () => number | undefined) => Promise<VoiceStatus>>((item) =>
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

  test("lets the item already running read what is waiting on it", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(0);
    const readPending = run.mock.calls[0]?.[1];

    expect(readPending?.()).toBeUndefined();

    const second = push(1);

    expect(readPending?.()).toBe(1);

    endFirstRun(VoiceStatus.Superseded);

    await expect(first).resolves.toBe(VoiceStatus.Superseded);
    await expect(second).resolves.toBe(VoiceStatus.Ok);
  });
});
