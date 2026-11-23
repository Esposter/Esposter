// Which worker holds each tile asked of the pool, so a worker's error fails only the tiles it holds.
// A tile is asked of the next worker in turn that has not errored, which holds it until it answers or fails it.
// An answer from a worker that no longer holds the tile is refused, so a late copy never replaces the one being built.
// A worker that errored is retired and takes no tile again, so a tile is held by none once every worker is retired.
// And the pool fails it rather than wait on a worker that will never answer.
export const createTileHolders = (workerCount: number) => {
  const tileHolderIndexMap = new Map<number, number>();
  const retiredWorkerIndexSet = new Set<number>();
  let nextWorkerIndex = 0;
  return {
    assign: (key: number): number | undefined => {
      for (let attempt = 0; attempt < workerCount; attempt++) {
        const workerIndex = nextWorkerIndex;
        nextWorkerIndex = (nextWorkerIndex + 1) % workerCount;
        if (retiredWorkerIndexSet.has(workerIndex)) continue;

        tileHolderIndexMap.set(key, workerIndex);
        return workerIndex;
      }
      return undefined;
    },
    checkIsHeldBy: (key: number, workerIndex: number): boolean => tileHolderIndexMap.get(key) === workerIndex,
    release: (key: number): void => {
      tileHolderIndexMap.delete(key);
    },
    retire: (workerIndex: number): void => {
      retiredWorkerIndexSet.add(workerIndex);
    },
    takeHeldKeys: (workerIndex: number): number[] => {
      const heldKeys = [...tileHolderIndexMap]
        .filter(([, holderIndex]) => holderIndex === workerIndex)
        .map(([key]) => key);
      for (const key of heldKeys) tileHolderIndexMap.delete(key);
      return heldKeys;
    },
  };
};
