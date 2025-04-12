import type { Type } from "arktype";

import { type } from "arktype";

export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

export const sortOrderSchema = type.valueOf(SortOrder) satisfies Type<SortOrder>;
