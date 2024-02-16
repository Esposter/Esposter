import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { CommonPaginationData } from "@/models/shared/pagination/CommonPaginationData";

export class OffsetPaginationData<TItem extends ItemMetadata> extends CommonPaginationData<TItem> {
  constructor(init?: Partial<OffsetPaginationData<TItem>>) {
    super();
    Object.assign(this, init);
  }
}
