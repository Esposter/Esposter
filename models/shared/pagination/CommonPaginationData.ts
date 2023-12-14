import type { Item } from "@/models/shared/Item";

export interface CommonPaginationData<TItem extends Item> {
  items: TItem[];
  hasMore: boolean;
}
