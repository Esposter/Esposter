import type { LayoutItem } from "#shared/models/dashboard/data/LayoutItem";

export const checkIsSameCell = (item: LayoutItem, other: LayoutItem) =>
  item.h === other.h && item.w === other.w && item.x === other.x && item.y === other.y;
