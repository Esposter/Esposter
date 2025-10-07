import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { getIsServer } from "#shared/util/environment/getIsServer";

export const serialize = <TItem extends object>(item: TItem, sortBy: SortItem<keyof TItem & string>[]): string => {
  const itemCursors = sortBy.reduce<Record<string, unknown>>((acc, { key }) => {
    const value = item[key];
    acc[key] = value;
    return acc;
  }, {});
  const payload = JSON.stringify(itemCursors);
  return getIsServer() ? Buffer.from(payload).toString("base64") : btoa(payload);
};
