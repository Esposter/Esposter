// Which worker holds each tile asked of the pool, so a worker's error fails only the tiles it holds.
// A tile is asked of the next worker in turn, and that worker holds it until it answers or fails it.
// An answer from a worker that no longer holds the tile is refused, so a late copy never replaces the one being built.
export const createTileHolders = (workerCount: number) => {
  const tileHolderIndexMap = new Map<number, number>();
  let nextWorkerIndex = 0;
  return {
    assign: (key: number): number => {
      const workerIndex = nextWorkerIndex;
      nextWorkerIndex = (nextWorkerIndex + 1) % workerCount;
      tileHolderIndexMap.set(key, workerIndex);
      return workerIndex;
    },
    checkIsHeldBy: (key: number, workerIndex: number): boolean => tileHolderIndexMap.get(key) === workerIndex,
    release: (key: number): void => {
      tileHolderIndexMap.delete(key);
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
