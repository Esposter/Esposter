import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";
import type { ItemMetadata } from "@/shared/models/itemMetadata";

export const serialize = <TItem extends ItemMetadata>(
  item: TItem | undefined,
  sortBy: SortItem<keyof TItem & string>[],
): string | undefined => {
  if (!item) return undefined;

  const keys = sortBy.map((s) => s.key);
  const itemCursors = keys.reduce<Record<string, unknown>>((acc, key) => {
    const value = item[key];
    acc[key] = value;
    return acc;
  }, {});
  return Buffer.from(JSON.stringify(itemCursors)).toString("base64");
};