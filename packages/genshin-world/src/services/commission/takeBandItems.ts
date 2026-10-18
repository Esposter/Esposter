import type { RewardItem } from "#src/models/reward/RewardItem";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The items of one band of a reward table, an error where the table has no such band
export const takeBandItems = (bands: RewardItem[][], bandIndex: number, owner: string): RewardItem[] => {
  const items = bands[bandIndex];
  if (!items) throw new InvalidOperationError(Operation.Read, owner, `has no items for band ${bandIndex}`);
  return items;
};
