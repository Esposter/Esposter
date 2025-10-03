import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const useCursorPaginationData = <TItem extends ToData<AEntity>>(): ReturnType<
  typeof useCursorPaginationOperationData<TItem>
> => {
  const cursorPaginationData = ref(new CursorPaginationData()) as Ref<CursorPaginationData<TItem>>;
  return useCursorPaginationOperationData(cursorPaginationData);
};
