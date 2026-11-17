// The recipe or blueprint each diagram or instruction item opens, by the item's id, read off each one's unlock items
export const createUnlockItemMap = <Unlock extends { unlockItemIds: number[] }>(
  unlocks: readonly Unlock[],
): ReadonlyMap<number, Unlock> =>
  new Map(unlocks.flatMap((unlock) => unlock.unlockItemIds.map((itemId): [number, Unlock] => [itemId, unlock])));
