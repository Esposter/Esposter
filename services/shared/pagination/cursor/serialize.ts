import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { type SortItem } from "@/models/shared/pagination/sorting/SortItem";

export const serialize = <TItem extends ItemMetadata>(
  item: TItem | undefined,
  sortBy: SortItem<keyof TItem & string>[],
): string | null => {
  if (!item) return null;

  const keys = sortBy.map((s) => s.key);
  const itemCursors = keys.reduce(
    (acc, key) => {
      const value = item[key];
      acc[key] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
  return Buffer.from(JSON.stringify(itemCursors)).toString("base64");
};
