export interface PaginationData<TItem extends object> {
  items: TItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
