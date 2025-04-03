import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";

export class BasePaginationData<TItem extends ToData<AEntity>> {
  hasMore = false;
  items: TItem[] = [];
}
