// /* eslint-disable perfectionist/sort-objects */
import { FilterType } from "#shared/models/message/FilterType";

export const SearchFilterComponentMap = {
  [FilterType.From]: defineAsyncComponent(() => import("@/components/Message/Content/Search/Filter/UserPicker.vue")),
  [FilterType.Mentions]: defineAsyncComponent(
    () => import("@/components/Message/Content/Search/Filter/UserPicker.vue"),
  ),
  // [FilterType.Has]: null,
  // [FilterType.Before]: null,
  // [FilterType.During]: null,
  // [FilterType.After]: null,
  // [FilterType.Pinned]: null,
  // [FilterType.AuthorType]: null,
} as const satisfies Record<FilterType, Component | null>;
