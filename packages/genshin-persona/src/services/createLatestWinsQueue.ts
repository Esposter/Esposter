import { VoiceStatus } from "#src/models/VoiceStatus";

// One pending item, replaced by whatever arrives after it: the caller of a replaced item learns it was superseded,
// And the item running when it arrived can read what is waiting on it, so a reading already under way can stop at
// Its next sentence for a newer reply rather than read a whole stale one out over it — and can tell that from a
// Request that only warms, which is not worth cutting a sentence for. Two replies landing while one is synthesized
// Leave the newer spoken and the older dropped, never a queue of stale sentences read out in order. Every push
// Chains one turn onto the last — the first of a run starts at once, every later one waits for the one before —
// And a turn whose item was superseded before it finds nothing to run
export const createLatestWinsQueue = <T>(
  run: (item: T, readPending: () => T | undefined) => Promise<VoiceStatus>,
): ((item: T) => Promise<VoiceStatus>) => {
  let pending: undefined | { item: T; resolve: (status: VoiceStatus) => void };
  let turns: Promise<void> = Promise.resolve();
  let queuedTurns = 0;
  const takeTurn = async (previous: Promise<void>, isFirst: boolean) => {
    if (!isFirst) await previous;
    if (pending) {
      const { item, resolve } = pending;
      pending = undefined;
      resolve(await run(item, () => pending?.item));
    }

    queuedTurns -= 1;
  };

  return (item) => {
    pending?.resolve(VoiceStatus.Superseded);
    const { promise, resolve } = Promise.withResolvers<VoiceStatus>();
    pending = { item, resolve };
    queuedTurns += 1;
    turns = takeTurn(turns, queuedTurns === 1);
    return promise;
  };
};
