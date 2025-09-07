import type { PageSettings } from "@/models/PageSettings";
/**
 * An interface that allows async iterable iteration both to completion and by page.
 */
export interface PagedAsyncIterableIterator<TElement, TPage = TElement[], TPageSettings = PageSettings> {
  /**
   * The connection to the async iterator, part of the iteration protocol
   */
  [Symbol.asyncIterator](): PagedAsyncIterableIterator<TElement, TPage, TPageSettings>;
  /**
   * Return an AsyncIterableIterator that works a page at a time
   */
  byPage: (settings?: TPageSettings) => AsyncIterableIterator<TPage>;
  /**
   * The next method, part of the iteration protocol
   */
  next(): Promise<IteratorResult<TElement>>;
}
