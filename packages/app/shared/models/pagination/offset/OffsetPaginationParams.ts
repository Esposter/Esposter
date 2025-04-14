import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsScope } from "#shared/models/pagination/BasePaginationParams";

export interface OffsetPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  offset?: number;
}

export const offsetPaginationParamsSchema = createBasePaginationParamsScope().type("<TSortKey extends string>", {
  "...": "BasePaginationParams<TSortKey>",
  offset: "number >= 0 = 0",
});
