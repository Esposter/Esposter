/* eslint-disable perfectionist/sort-objects */
import { joinWithOxfordOr } from "#shared/util/text/joinWithOxfordOr";
import { FilterType, FilterTypeHases } from "@esposter/db-schema";
import { uncapitalize } from "@esposter/shared";

export const FilterTypePlaceholderMap = {
  [FilterType.From]: "user",
  [FilterType.In]: "room",
  [FilterType.Mentions]: "user",
  [FilterType.Has]: joinWithOxfordOr(Array.from(FilterTypeHases, (has) => uncapitalize(has))),
  [FilterType.Before]: "specific date",
  [FilterType.During]: "specific date",
  [FilterType.After]: "specific date",
  [FilterType.Pinned]: "true or false",
  // [FilterType.AuthorType]: "user, bot or webhook",
} as const satisfies Record<FilterType, string>;
