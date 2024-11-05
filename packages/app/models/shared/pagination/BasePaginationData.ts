import type { ItemMetadata } from "@/shared/models/itemMetadata";

export class BasePaginationData<TItem extends ItemMetadata> {
  hasMore = false;
  items: TItem[] = [];
}
