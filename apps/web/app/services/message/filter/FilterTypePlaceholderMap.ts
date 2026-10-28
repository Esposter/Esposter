import { EN_US_DISJUNCTION_FORMATTER } from "#shared/services/intl/constants";
import { FilterType, FilterTypeAuthorTypes, FilterTypeHases } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";

export const FilterTypePlaceholderMap = {
  [FilterType.After]: "specific date",
  [FilterType.AuthorType]: EN_US_DISJUNCTION_FORMATTER.format(FilterTypeAuthorTypes.map((type) => uncapitalize(type))),
  [FilterType.Before]: "specific date",
  [FilterType.During]: "specific date",
  [FilterType.From]: "user",
  [FilterType.Has]: EN_US_DISJUNCTION_FORMATTER.format(FilterTypeHases.map((has) => uncapitalize(has))),
  [FilterType.In]: "room",
  [FilterType.Mentions]: "user",
  [FilterType.Pinned]: "true or false",
} as const satisfies Record<FilterType, string>;
