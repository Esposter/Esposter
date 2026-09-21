import { VoiceStatus } from "#src/models/VoiceStatus";
import { createLatestWinsQueue } from "#src/services/createLatestWinsQueue";
import { describe, expect, test, vi } from "vitest";

describe(createLatestWinsQueue, () => {
  // A turn's opening and closing lines, the opening line of the turn after it, and a warm, which has no turn
  const turnId = crypto.randomUUID();
  const opening = { turnId };
  const closing = { turnId };
  const later = { turnId: crypto.randomUUID() };
  const warm = { turnId: "" };
  const getRun = (firstRun: Promise<VoiceStatus>) =>
    vi.fn<(item: { turnId: string }, readPending: () => undefined | { turnId: string }) => Promise<VoiceStatus>>(
      (item) => (item === opening ? firstRun : Promise.resolve(VoiceStatus.Ok)),
    );

  test("reads a turn's items in order once the running one ends", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(opening);
    const second = push(closing);
    endFirstRun(VoiceStatus.Ok);

    await expect(first).resolves.toBe(VoiceStatus.Ok);
    await expect(second).resolves.toBe(VoiceStatus.Ok);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[1]?.[0]).toBe(closing);
  });

  test("drops what of a turn is still waiting when a newer turn arrives", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(opening);
    const second = push(closing);
    const third = push(later);

    await expect(second).resolves.toBe(VoiceStatus.Superseded);

    endFirstRun(VoiceStatus.Ok);

    await expect(first).resolves.toBe(VoiceStatus.Ok);
    await expect(third).resolves.toBe(VoiceStatus.Ok);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[1]?.[0]).toBe(later);
  });

  test("queues an item with no turn behind what is waiting rather than dropping it", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(opening);
    const second = push(closing);
    const third = push(warm);
    endFirstRun(VoiceStatus.Ok);

    await expect(first).resolves.toBe(VoiceStatus.Ok);
    await expect(second).resolves.toBe(VoiceStatus.Ok);
    await expect(third).resolves.toBe(VoiceStatus.Ok);
    expect(run).toHaveBeenCalledTimes(3);
    expect(run.mock.calls[2]?.[0]).toBe(warm);
  });

  test("lets the item already running read what is waiting on it", async () => {
    expect.hasAssertions();

    const { promise: firstRun, resolve: endFirstRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(firstRun);
    const push = createLatestWinsQueue(run);
    const first = push(opening);
    const readPending = run.mock.calls[0]?.[1];

    expect(readPending?.()).toBeUndefined();

    const second = push(later);

    expect(readPending?.()).toBe(later);

    endFirstRun(VoiceStatus.Superseded);

    await expect(first).resolves.toBe(VoiceStatus.Superseded);
    await expect(second).resolves.toBe(VoiceStatus.Ok);
  });
});
