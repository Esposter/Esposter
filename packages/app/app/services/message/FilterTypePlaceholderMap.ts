/* eslint-disable perfectionist/sort-objects */
import { FilterType } from "#shared/models/message/FilterType";
import { FilterTypeHas } from "#shared/models/message/FilterTypeHas";
import { joinWithOxfordOr } from "@/util/text/joinWithOxfordOr";
import { uncapitalize } from "@esposter/shared";

export const FilterTypePlaceholderMap = {
  [FilterType.From]: "user",
  [FilterType.Mentions]: "user",
  [FilterType.Has]: joinWithOxfordOr(Object.values(FilterTypeHas).map((has) => uncapitalize(has))),
  [FilterType.Before]: "specific date",
  [FilterType.During]: "specific date",
  [FilterType.After]: "specific date",
  [FilterType.Pinned]: "true or false",
  // [FilterType.AuthorType]: "user, bot or webhook",
} as const satisfies Record<FilterType, string>;
