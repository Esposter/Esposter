import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { CommonPaginationData } from "@/models/shared/pagination/CommonPaginationData";

export class CursorPaginationData<TItem extends ItemMetadata> extends CommonPaginationData<TItem> {
  nextCursor: string | null = null;
}
