import type { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

// Every paginated read asks for one item past its limit, and that extra item is the whole answer to
// `hasMore` — so it is dropped from the page here rather than at each call site, where an off-by-one
// Would silently either skip an item or report a full page as truncated
export const getBasePaginationData = <TItem>(items: TItem[], limit: number): BasePaginationData<TItem> => {
  const hasMore = items.length > limit;
  return { hasMore, items: hasMore ? items.slice(0, limit) : items };
};
