export interface PaginationData<TItem extends object, TItemKey extends keyof TItem> {
  items: TItem[];
  nextCursor: TItem[TItemKey] | null;
  hasMore: boolean;
}
