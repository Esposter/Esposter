export class BasePaginationData<TItem> {
  hasMore = false;
  items: TItem[] = [];

  constructor(init?: BasePaginationData<TItem>) {
    Object.assign(this, init);
  }
}
