import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class OffsetPaginationData<TItem> extends BasePaginationData<TItem> {
  constructor(init?: OffsetPaginationData<TItem>) {
    super(init);
    Object.assign(this, init);
  }
}
