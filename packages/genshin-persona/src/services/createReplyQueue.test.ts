import type { ReplyPiece } from "#src/models/ReplyPiece";

import { VoiceStatus } from "#src/models/VoiceStatus";
import { TURNLESS_PIECE } from "#src/services/constants";
import { createReplyQueue } from "#src/services/createReplyQueue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createReplyQueue, () => {
  const holdMs = 1;
  // One turn's message: its opening line and its closing line; the opening piece of the message after it in the
  // Same turn, and of the turn after that; and a warm, which has no turn
  const turnId = crypto.randomUUID();
  const messageId = crypto.randomUUID();
  const opening: ReplyPiece = { index: 0, isFinal: false, messageId, turnId };
  const closing: ReplyPiece = { index: 1, isFinal: true, messageId, turnId };
  const nextMessage: ReplyPiece = { index: 0, isFinal: true, messageId: crypto.randomUUID(), turnId };
  const later: ReplyPiece = { index: 0, isFinal: true, messageId: crypto.randomUUID(), turnId: crypto.randomUUID() };
  const getRun = (openingRun: Promise<VoiceStatus> = Promise.resolve(VoiceStatus.Ok)) =>
    vi.fn<(piece: ReplyPiece, checkIsSuperseded: () => boolean) => Promise<VoiceStatus>>((piece) =>
      piece === opening ? openingRun : Promise.resolve(VoiceStatus.Ok),
    );
  const getRunPieces = (run: ReturnType<typeof getRun>) => run.mock.calls.map(([piece]) => piece);

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("reads a message's pieces by their index however they arrive", async () => {
    expect.hasAssertions();

    const run = getRun();
    const push = createReplyQueue(run, holdMs);
    const second = push(closing);
    const first = push(opening);

    await expect(Promise.all([first, second])).resolves.toStrictEqual([VoiceStatus.Ok, VoiceStatus.Ok]);
    expect(getRunPieces(run)).toStrictEqual([opening, closing]);
  });

  test("holds a piece for one before it that has not arrived, and moves on once the hook's timeout passes", async () => {
    expect.hasAssertions();

    const run = getRun();
    const push = createReplyQueue(run, holdMs);
    const second = push(closing);
    await vi.advanceTimersByTimeAsync(0);

    expect(run).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(holdMs);

    await expect(second).resolves.toBe(VoiceStatus.Ok);
    expect(getRunPieces(run)).toStrictEqual([closing]);
  });

  test("starts the next message once the one before it ran its final piece", async () => {
    expect.hasAssertions();

    const run = getRun();
    const push = createReplyQueue(run, holdMs);
    const first = push(opening);
    const third = push(nextMessage);
    await vi.advanceTimersByTimeAsync(0);

    expect(getRunPieces(run)).toStrictEqual([opening]);

    const second = push(closing);

    await expect(Promise.all([first, second, third])).resolves.toStrictEqual([
      VoiceStatus.Ok,
      VoiceStatus.Ok,
      VoiceStatus.Ok,
    ]);
    expect(getRunPieces(run)).toStrictEqual([opening, closing, nextMessage]);
  });

  test("drops what of a turn is still waiting when a newer turn arrives, and tells the piece running", async () => {
    expect.hasAssertions();

    const { promise: openingRun, resolve: endOpeningRun } = Promise.withResolvers<VoiceStatus>();
    const run = getRun(openingRun);
    const push = createReplyQueue(run, holdMs);
    const first = push(opening);
    const second = push(closing);
    await vi.advanceTimersByTimeAsync(0);
    const checkIsSuperseded = run.mock.calls[0]?.[1];

    expect(checkIsSuperseded?.()).toBe(false);

    const third = push(later);

    await expect(second).resolves.toBe(VoiceStatus.Superseded);
    expect(checkIsSuperseded?.()).toBe(true);

    endOpeningRun(VoiceStatus.Superseded);

    await expect(first).resolves.toBe(VoiceStatus.Superseded);
    await expect(third).resolves.toBe(VoiceStatus.Ok);
    expect(getRunPieces(run)).toStrictEqual([opening, later]);
  });

  test("queues a piece with no turn behind what is waiting rather than dropping it", async () => {
    expect.hasAssertions();

    const run = getRun();
    const push = createReplyQueue(run, holdMs);
    const first = push(opening);
    const third = push(TURNLESS_PIECE);
    const second = push(closing);

    await expect(Promise.all([first, second, third])).resolves.toStrictEqual([
      VoiceStatus.Ok,
      VoiceStatus.Ok,
      VoiceStatus.Ok,
    ]);
    expect(getRunPieces(run)).toStrictEqual([opening, closing, TURNLESS_PIECE]);
  });
});
