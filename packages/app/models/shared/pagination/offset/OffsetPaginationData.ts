import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import { BasePaginationData } from "@/models/shared/pagination/BasePaginationData";

export class OffsetPaginationData<TItem extends ItemMetadata> extends BasePaginationData<TItem> {}
