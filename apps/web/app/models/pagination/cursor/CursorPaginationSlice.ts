import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

// One partition's rows, addressed by naming that partition. Everything that writes a paginated list resolves one
// Of these when its operation is issued, so a response landing after the reader moved on is still filed under the
// Partition it was issued for — and the partition cannot be resolved a second time, at write time, by accident
export interface CursorPaginationSlice<TItem> {
  initializeCursorPaginationData: (data: CursorPaginationData<TItem>) => void;
  isLoaded: Ref<boolean>;
  items: Ref<TItem[]>;
}
