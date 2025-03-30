import type { ItemMetadata } from "#shared/models/entity/ItemMetadata";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

export const serialize = <TItem extends ItemMetadata>(
  item: TItem | undefined,
  sortBy: SortItem<keyof TItem & string>[],
): string | undefined => {
  if (!item) return undefined;

  const keys = sortBy.map(({ key }) => key);
  const itemCursors = keys.reduce<Record<string, unknown>>((acc, key) => {
    const value = item[key];
    acc[key] = value;
    return acc;
  }, {});
  return Buffer.from(JSON.stringify(itemCursors)).toString("base64");
};
