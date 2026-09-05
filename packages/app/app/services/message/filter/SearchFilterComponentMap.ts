/* eslint-disable perfectionist/sort-objects */
import { FilterType } from "@esposter/db-schema";

// Named once each, because several filter types share a picker — three dates and two user pickers would
// Otherwise each declare their own loader for the same chunk
const UserPicker = defineAsyncComponent(() => import("@/components/Message/RightSideBar/Search/Filter/UserPicker.vue"));
const DatePicker = defineAsyncComponent(() => import("@/components/Message/RightSideBar/Search/Filter/DatePicker.vue"));

export const SearchFilterComponentMap = {
  [FilterType.From]: UserPicker,
  [FilterType.In]: defineAsyncComponent(() => import("@/components/Message/RightSideBar/Search/Filter/RoomPicker.vue")),
  [FilterType.Mentions]: UserPicker,
  [FilterType.Has]: defineAsyncComponent(() => import("@/components/Message/RightSideBar/Search/Filter/HasPicker.vue")),
  [FilterType.Before]: DatePicker,
  [FilterType.During]: DatePicker,
  [FilterType.After]: DatePicker,
  [FilterType.Pinned]: defineAsyncComponent(
    () => import("@/components/Message/RightSideBar/Search/Filter/PinPicker.vue"),
  ),
} as const satisfies Record<FilterType, Component>;
