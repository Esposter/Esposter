import { type Item } from "@/models/shared/Item";
import { CommonPaginationData } from "@/models/shared/pagination/CommonPaginationData";

export class OffsetPaginationData<TItem extends Item> extends CommonPaginationData<TItem> {}
