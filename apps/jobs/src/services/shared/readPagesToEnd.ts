/* oxlint-disable no-await-in-loop -- Bounded concurrency: one page of a list is read at a time, each from the last item of the page before it */
// Each page of a keyed read, from the start of its list to the end. A page is asked for from the last item of the one before
// It, and a page shorter than the limit is the last one, so an item is never read twice and none is skipped. Each page is
// Handed to `onPage` before the next is asked for, so a caller holds one page at a time
export const readPagesToEnd = async <TItem, TAfter>(
  readPage: (after: TAfter | undefined, limit: number) => Promise<TItem[]>,
  getAfter: (item: TItem) => TAfter,
  limit: number,
  onPage: (page: TItem[]) => Promise<void> | void,
): Promise<void> => {
  let after: TAfter | undefined;
  let page: TItem[];
  do {
    page = await readPage(after, limit);
    await onPage(page);
    const lastItem = page.at(-1);
    if (lastItem !== undefined) after = getAfter(lastItem);
  } while (page.length === limit);
};
