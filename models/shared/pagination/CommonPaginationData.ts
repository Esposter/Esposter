import { type ItemMetadata } from "@/models/shared/ItemMetadata";

export class CommonPaginationData<TItem extends ItemMetadata> {
  items: TItem[] = [];
  hasMore = false;

  constructor(init?: Partial<CommonPaginationData<TItem>>) {
    Object.assign(this, init);
  }
}
