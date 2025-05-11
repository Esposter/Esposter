import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class CursorPaginationData<TItem> extends BasePaginationData<TItem> {
  nextCursor?: string;
}
