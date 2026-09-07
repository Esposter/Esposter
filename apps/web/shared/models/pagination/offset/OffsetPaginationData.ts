import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

// Adds no field of its own — it names the offset half of the pair, opposite CursorPaginationData's nextCursor
export class OffsetPaginationData<TItem> extends BasePaginationData<TItem> {}
