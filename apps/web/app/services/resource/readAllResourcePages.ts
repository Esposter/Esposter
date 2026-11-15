import type { Page } from "@esposter/db-schema";

// Every item of a cursor-paged listing, read through each page to its end, so a picker offers all of them rather than the
// First page. Each page starts from the cursor the one before it answered, which is the only order a cursor allows. The
// Limit, when given, ends the reads once the items read reach it
export const readAllResourcePages = async <TItem>(
  readPage: (cursor: string) => Promise<Page<TItem>>,
  maxItemCount = Number.POSITIVE_INFINITY,
  cursor = "",
  items: TItem[] = [],
): Promise<TItem[]> => {
  const page = await readPage(cursor);
  items.push(...page.items);
  return page.nextCursor && items.length < maxItemCount
    ? readAllResourcePages(readPage, maxItemCount, page.nextCursor, items)
    : items;
};
