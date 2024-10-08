import type { ItemMetadata } from "@/models/shared/ItemMetadata";

import { BasePaginationData } from "@/models/shared/pagination/BasePaginationData";

export class CursorPaginationData<TItem extends ItemMetadata> extends BasePaginationData<TItem> {
  nextCursor?: string;
}
