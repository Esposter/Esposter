import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ToData } from "#shared/models/entity/ToData";

export class BasePaginationData<TItem extends ToData<AItemEntity>> {
  hasMore = false;
  items: TItem[] = [];
}
