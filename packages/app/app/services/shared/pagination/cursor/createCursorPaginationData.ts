import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { createCursorPaginationOperationData } from "@/services/shared/pagination/cursor/createCursorPaginationOperationData";

export const createCursorPaginationData = <TItem extends ToData<AEntity>>() => {
  const cursorPaginationData = ref(new CursorPaginationData()) as Ref<CursorPaginationData<TItem>>;
  return createCursorPaginationOperationData(cursorPaginationData);
};
