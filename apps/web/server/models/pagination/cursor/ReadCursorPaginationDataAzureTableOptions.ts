import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Clause } from "@esposter/azure";
import type { AzureEntity } from "@esposter/db-schema";

export interface ReadCursorPaginationDataAzureTableOptions<TEntity extends AzureEntity> {
  clauses: Clause<TEntity>[];
  cursor: string;
  limit: number;
  sortBy: SortItem<keyof TEntity & string>[];
}
