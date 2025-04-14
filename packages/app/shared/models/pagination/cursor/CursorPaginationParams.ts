import type { BasePaginationParams } from "#shared/models/pagination/BasePaginationParams";

import { createBasePaginationParamsScope } from "#shared/models/pagination/BasePaginationParams";

export interface CursorPaginationParams<TSortKey extends string> extends BasePaginationParams<TSortKey> {
  // This will be a serialised string of all the cursors based on sorting
  cursor?: string;
}
// We need at least one sort item so we can derive a primary cursor for pagination
export const cursorPaginationParamsSchema = createBasePaginationParamsScope(1).type("<TSortKey extends string>", {
  "...": "BasePaginationParams<TSortKey>",
  cursor: "string?",
});
