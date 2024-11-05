import type { ItemMetadata } from "@/shared/models/itemMetadata";

import { BasePaginationData } from "@/models/shared/pagination/BasePaginationData";

export class CursorPaginationData<TItem extends ItemMetadata> extends BasePaginationData<TItem> {
  nextCursor?: string;
}
