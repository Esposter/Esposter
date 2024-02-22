import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import { CommonPaginationData } from "@/models/shared/pagination/CommonPaginationData";

export class OffsetPaginationData<TItem extends ItemMetadata> extends CommonPaginationData<TItem> {}
