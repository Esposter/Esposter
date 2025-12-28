import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { getIsServer } from "@esposter/shared";

export const serialize = <TItem extends object>(item: TItem, sortBy: SortItem<keyof TItem & string>[]): string => {
  const itemCursors = Object.fromEntries(sortBy.map(({ key }) => [key, item[key]]));
  const payload = JSON.stringify(itemCursors);
  return getIsServer() ? Buffer.from(payload).toString("base64") : btoa(payload);
};
