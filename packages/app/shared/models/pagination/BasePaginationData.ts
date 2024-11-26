import type { ItemMetadata } from "@/shared/models/entity/ItemMetadata";

export class BasePaginationData<TItem extends ItemMetadata> {
  hasMore = false;
  items: TItem[] = [];
}
