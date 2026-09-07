/* eslint-disable perfectionist/sort-objects */
import { EN_US_DISJUNCTION_FORMATTER } from "#shared/services/intl/constants";
import { FilterType, FilterTypeHases } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";

export const FilterTypePlaceholderMap = {
  [FilterType.From]: "user",
  [FilterType.In]: "room",
  [FilterType.Mentions]: "user",
  [FilterType.Has]: EN_US_DISJUNCTION_FORMATTER.format(FilterTypeHases.map((has) => uncapitalize(has))),
  [FilterType.Before]: "specific date",
  [FilterType.During]: "specific date",
  [FilterType.After]: "specific date",
  [FilterType.Pinned]: "true or false",
} as const satisfies Record<FilterType, string>;
