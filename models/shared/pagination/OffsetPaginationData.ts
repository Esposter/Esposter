import { type Item } from "@/models/shared/Item";
import { type CommonPaginationData } from "@/models/shared/pagination/CommonPaginationData";

export interface OffsetPaginationData<TItem extends Item> extends CommonPaginationData<TItem> {}
