/* oxlint-disable no-await-in-loop -- Bounded concurrency: one page of a list is read at a time, each from the last item of the page before it */
import { readPages } from "#src/services/shared/readPages";

// Each page of a keyed read, from the start of its list to the end, is handed to `onPage` before the next is asked for,
// So a caller holds one page at a time. The paging itself is `readPages`'s
export const readPagesToEnd = async <TItem, TAfter>(
  readPage: (after: TAfter | undefined, limit: number) => Promise<TItem[]>,
  getAfter: (item: TItem) => TAfter,
  limit: number,
  onPage: (page: TItem[]) => Promise<void> | void,
): Promise<void> => {
  for await (const page of readPages(readPage, getAfter, limit)) await onPage(page);
};
