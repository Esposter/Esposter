import { type Item } from "@/models/shared/Item";
import { type CommonPaginationData } from "@/models/shared/pagination/CommonPaginationData";

export interface CursorPaginationData<TItem extends Item, TItemKey extends keyof TItem>
  extends CommonPaginationData<TItem> {
  nextCursor: TItem[TItemKey] | null;
}
