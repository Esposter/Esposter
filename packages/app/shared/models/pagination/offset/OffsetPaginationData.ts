import type { ItemMetadata } from "#shared/models/entity/ItemMetadata";

import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

export class OffsetPaginationData<TItem extends ItemMetadata> extends BasePaginationData<TItem> {}
