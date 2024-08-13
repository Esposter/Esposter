import type { ItemMetadata } from "@/models/shared/ItemMetadata";

export class BasePaginationData<TItem extends ItemMetadata> {
  hasMore = false;
  items: TItem[] = [];
}
