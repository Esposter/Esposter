import type { ItemMetadata } from "#shared/models/entity/ItemMetadata";

import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class CursorPaginationData<TItem extends ItemMetadata> extends BasePaginationData<TItem> {
  nextCursor?: string;
}
