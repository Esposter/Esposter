export interface PaginationData<T extends object> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
