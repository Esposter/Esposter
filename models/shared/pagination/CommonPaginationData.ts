import { type Item } from "@/models/shared/Item";

export class CommonPaginationData<TItem extends Item> {
  items: TItem[] = [];
  hasMore = false;
}
