// The worker each generating tile was asked of, so a worker that errors fails only the tiles it holds. An answer from a
// Worker a tile was no longer asked of leaves the tile held by the one it was asked of
export const createTileWorkerLedger = () => {
  const tileWorkerIndexMap = new Map<number, number>();
  return {
    assign: (key: number, workerIndex: number) => {
      tileWorkerIndexMap.set(key, workerIndex);
    },
    keysOf: (workerIndex: number): number[] =>
      [...tileWorkerIndexMap].flatMap(([key, heldWorkerIndex]) => (heldWorkerIndex === workerIndex ? [key] : [])),
    release: (key: number, workerIndex: number) => {
      if (tileWorkerIndexMap.get(key) === workerIndex) tileWorkerIndexMap.delete(key);
    },
  };
};
