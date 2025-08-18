import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class OffsetPaginationData<TItem> extends BasePaginationData<TItem> {
  offset = 0;

  constructor(init?: OffsetPaginationData<TItem>) {
    super(init);
    Object.assign(this, init);
  }
}
