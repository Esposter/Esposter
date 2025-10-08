/* eslint-disable perfectionist/sort-objects */
import { FilterType } from "@esposter/shared/src/models/message/filter/FilterType";

export const SearchFilterComponentMap = {
  [FilterType.From]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/UserPicker.vue"),
  ),
  [FilterType.Mentions]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/UserPicker.vue"),
  ),
  [FilterType.Has]: defineAsyncComponent(() => import("@/components/Message/RightSideBar/Search/Filter/HasPicker.vue")),
  [FilterType.Before]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/DatePicker.vue"),
  ),
  [FilterType.During]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/DatePicker.vue"),
  ),
  [FilterType.After]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/DatePicker.vue"),
  ),
  [FilterType.Pinned]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/PinPicker.vue"),
  ),
  // [FilterType.AuthorType]: null,
} as const satisfies Record<FilterType, Component | null>;
