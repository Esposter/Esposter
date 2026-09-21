import { VoiceStatus } from "#src/models/VoiceStatus";

// The pending items of one turn, in order, replaced whole by the first item of a newer turn: a reply's opening
// Line and its closing line are read one after the other, and a reply that lands while another is being read
// Drops what of the older one is still waiting. The caller of a dropped item learns it was superseded, and the
// Item running when a newer one arrived can read what is waiting on it, so a reading already under way can stop
// At its next line for a newer reply rather than read a stale one out over it — and can tell that from a request
// That only warms, which is not worth cutting a line for. Every push chains one turn onto the last — the first of
// A run starts at once, every later one waits for the one before — and a turn whose item was dropped before it
// Finds nothing to run
export const createLatestWinsQueue = <T extends { turnId: string }>(
  run: (item: T, readPending: () => T | undefined) => Promise<VoiceStatus>,
): ((item: T) => Promise<VoiceStatus>) => {
  let pending: { item: T; resolve: (status: VoiceStatus) => void }[] = [];
  let turns: Promise<void> = Promise.resolve();
  let queuedTurns = 0;
  const takeTurn = async (previous: Promise<void>, isFirst: boolean) => {
    if (!isFirst) await previous;
    const [next, ...rest] = pending;
    if (next) {
      pending = rest;
      next.resolve(await run(next.item, () => pending[0]?.item));
    }

    queuedTurns -= 1;
  };

  return (item) => {
    const [head] = pending;
    if (head && head.item.turnId !== item.turnId) {
      for (const { resolve } of pending) resolve(VoiceStatus.Superseded);
      pending = [];
    }

    const { promise, resolve } = Promise.withResolvers<VoiceStatus>();
    pending = [...pending, { item, resolve }];
    queuedTurns += 1;
    turns = takeTurn(turns, queuedTurns === 1);
    return promise;
  };
};
