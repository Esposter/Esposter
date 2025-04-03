import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class CursorPaginationData<TItem extends ToData<AItemEntity>> extends BasePaginationData<TItem> {
  nextCursor?: string;
}
