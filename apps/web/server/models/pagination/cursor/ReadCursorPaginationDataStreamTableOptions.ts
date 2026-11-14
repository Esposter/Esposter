import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import type { AzureEntity, Clause } from "@esposter/db-schema";

export interface ReadCursorPaginationDataStreamTableOptions<TEntity extends AzureEntity> {
  clauses: Clause<TEntity>[];
  cursor: string;
  limit: number;
  sortBy: SortItem<keyof TEntity & string>[];
}
