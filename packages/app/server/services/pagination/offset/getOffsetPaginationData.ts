import type { AEntity } from "#shared/models/entity/AEntity";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { ToData } from "@esposter/shared";

import { getBasePaginationData } from "@@/server/services/pagination/getBasePaginationData";

export const getOffsetPaginationData = <TItem extends ToData<AEntity>>(
  items: TItem[],
  limit: number,
): OffsetPaginationData<TItem> => getBasePaginationData(items, limit);
