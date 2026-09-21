import type { ReplyPiece } from "#src/models/ReplyPiece";

import { VoiceStatus } from "#src/models/VoiceStatus";

// The pieces of a reply, read in the order they were written however they arrive: the hooks that carry them run
// Concurrently, so a reply's closing line can land before its opening one. A message's pieces run by their index,
// Dense from zero — every flush is sent, spoken or not, so a piece is waited for only while one before it has yet
// To arrive — and the next message starts once the one before it ran its final piece. A piece held for one that
// Never comes is held for the hook's own timeout, past which the tool killed the hook that would have carried it,
// And the message moves on to the earliest piece of it still waiting. A newer turn's piece replaces whole what of
// The older turn still waits, and the piece running can ask whether one waits on it, so a reading already under
// Way stops at its next line rather than reading a stale one out over the newer reply. A piece with no turn — a
// Warm, the proof the `voice` verb speaks — is not a newer reply and queues behind whatever waits. A turn a newer
// One replaced is replaced for good, since the hooks run concurrently: a piece of it arriving after the turn that
// Replaced it is a late piece of a turn nobody is listening to, and is answered rather than read
export const createReplyQueue = <T extends ReplyPiece>(
  run: (piece: T, checkIsSuperseded: () => boolean) => Promise<VoiceStatus>,
  holdMs: number,
): ((piece: T) => Promise<VoiceStatus>) => {
  let waiting: { piece: T; resolve: (status: VoiceStatus) => void }[] = [];
  // The turn whose pieces the queue is taking, and every turn a newer one has taken it from
  let currentTurnId = "";
  const supersededTurnIds = new Set<string>();
  // The message being read and the index of its next piece; nothing between messages
  let reading: undefined | { messageId: string; nextIndex: number; turnId: string };
  let hold: ReturnType<typeof setTimeout> | undefined;
  let drain: Promise<void> = Promise.resolve();
  const takeNext = () => {
    const [first] = waiting;
    if (reading) {
      const { messageId, nextIndex } = reading;
      return waiting.find(({ piece }) => piece.messageId === messageId && piece.index === nextIndex);
    }

    if (!first?.piece.turnId) return first;
    // The earliest-arrived message opens with its first piece, even when that arrived after a later one
    return waiting.find(({ piece }) => piece.messageId === first.piece.messageId && piece.index === 0);
  };
  // Every drain chains onto the last, so one piece runs at a time
  const drainAfter = async (previous: Promise<void>) => {
    await previous;
    await drainNext();
  };
  const skipMissing = () => {
    hold = undefined;
    const [first] = waiting;
    const messageId = reading?.messageId ?? first?.piece.messageId ?? "";
    const turnId = reading?.turnId ?? first?.piece.turnId ?? "";
    const indexes = waiting.filter(({ piece }) => piece.messageId === messageId).map(({ piece }) => piece.index);
    reading = indexes.length > 0 ? { messageId, nextIndex: Math.min(...indexes), turnId } : undefined;
    drain = drainAfter(drain);
  };
  const drainNext = async (): Promise<void> => {
    const next = takeNext();
    if (!next) {
      if (waiting.length > 0) hold ??= setTimeout(skipMissing, holdMs);
      return;
    }

    clearTimeout(hold);
    hold = undefined;
    waiting = waiting.filter((entry) => entry !== next);
    const { piece } = next;
    if (piece.turnId)
      reading = piece.isFinal
        ? undefined
        : { messageId: piece.messageId, nextIndex: piece.index + 1, turnId: piece.turnId };
    next.resolve(
      await run(piece, () => waiting.some((entry) => entry.piece.turnId && entry.piece.turnId !== piece.turnId)),
    );
    return drainNext();
  };

  return (piece) => {
    if (supersededTurnIds.has(piece.turnId)) return Promise.resolve(VoiceStatus.Superseded);

    const isNewerTurn = Boolean(piece.turnId) && Boolean(currentTurnId) && currentTurnId !== piece.turnId;
    if (isNewerTurn) {
      supersededTurnIds.add(currentTurnId);
      for (const entry of waiting) if (entry.piece.turnId) entry.resolve(VoiceStatus.Superseded);
      waiting = waiting.filter((entry) => !entry.piece.turnId);
      reading = undefined;
    }

    if (piece.turnId) currentTurnId = piece.turnId;
    const { promise, resolve } = Promise.withResolvers<VoiceStatus>();
    waiting = [...waiting, { piece, resolve }];
    drain = drainAfter(drain);
    return promise;
  };
};
