import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class OffsetPaginationData<TItem extends ToData<AEntity>> extends BasePaginationData<TItem> {}
