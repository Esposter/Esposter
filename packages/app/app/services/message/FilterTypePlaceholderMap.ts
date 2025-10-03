/* eslint-disable perfectionist/sort-objects */
import { FilterType } from "#shared/models/message/FilterType";

export const FilterTypePlaceholderMap = {
  [FilterType.From]: "user",
  [FilterType.Mentions]: "user",
  // [FilterType.Has]: "link, embed or file",
  [FilterType.Before]: "specific date",
  [FilterType.During]: "specific date",
  [FilterType.After]: "specific date",
  // [FilterType.Pinned]: "true or false",
  // [FilterType.AuthorType]: "user, bot or webhook",
} as const satisfies Record<FilterType, string>;
