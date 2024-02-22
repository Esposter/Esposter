import type { ItemMetadata } from "@/models/shared/ItemMetadata";

export class CommonPaginationData<TItem extends ItemMetadata> {
  items: TItem[] = [];
  hasMore = false;
}
