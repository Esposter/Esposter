import type { Page } from "@esposter/db-schema";

// Every item of a cursor-paged listing is read through each page to its end.
// So a picker offers all of them rather than the first page.
// Each page starts from the cursor the one before it answered, which is the only order a cursor allows.
// The limit, when given, ends the reads once the items read reach it.
export const readAllResourcePages = async <TItem>(
  readPage: (cursor: string) => Promise<Page<TItem>>,
  maxItemCount = Number.POSITIVE_INFINITY,
  cursor = "",
  items: TItem[] = [],
): Promise<TItem[]> => {
  let pageCursor = cursor;
  let page: Page<TItem>;
  do {
    // oxlint-disable-next-line no-await-in-loop -- Pagination: each page starts at the cursor the last one answered
    page = await readPage(pageCursor);
    items.push(...page.items);
    pageCursor = page.nextCursor;
  } while (page.nextCursor && items.length < maxItemCount);
  return items;
};
