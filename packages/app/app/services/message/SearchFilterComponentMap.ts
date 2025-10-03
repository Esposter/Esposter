/* eslint-disable perfectionist/sort-objects */
import { FilterType } from "#shared/models/message/FilterType";

export const SearchFilterComponentMap = {
  [FilterType.From]: defineAsyncComponent(() => import("@/components/Message/Content/Search/Filter/UserPicker.vue")),
  [FilterType.Mentions]: defineAsyncComponent(
    () => import("@/components/Message/Content/Search/Filter/UserPicker.vue"),
  ),
  // [FilterType.Has]: null,
  [FilterType.Before]: defineAsyncComponent(() => import("@/components/Message/Content/Search/Filter/DatePicker.vue")),
  [FilterType.During]: defineAsyncComponent(() => import("@/components/Message/Content/Search/Filter/DatePicker.vue")),
  [FilterType.After]: defineAsyncComponent(() => import("@/components/Message/Content/Search/Filter/DatePicker.vue")),
  // [FilterType.Pinned]: null,
  // [FilterType.AuthorType]: null,
} as const satisfies Record<FilterType, Component | null>;
