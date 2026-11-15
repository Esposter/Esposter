import { FilterType } from "@esposter/db-schema";

// Named once each, because several filter types share a picker — three dates and two user pickers would
// Otherwise each declare their own loader for the same chunk
const UserPicker = defineAsyncComponent(
  () => import("#src/components/Message/RightSideBar/Search/Filter/UserPicker.vue"),
);
const DatePicker = defineAsyncComponent(
  () => import("#src/components/Message/RightSideBar/Search/Filter/DatePicker.vue"),
);

export const SearchFilterComponentMap = {
  [FilterType.After]: DatePicker,
  [FilterType.AuthorType]: defineAsyncComponent(
    () => import("#src/components/Message/RightSideBar/Search/Filter/AuthorTypePicker.vue"),
  ),
  [FilterType.Before]: DatePicker,
  [FilterType.During]: DatePicker,
  [FilterType.From]: UserPicker,
  [FilterType.Has]: defineAsyncComponent(
    () => import("#src/components/Message/RightSideBar/Search/Filter/HasPicker.vue"),
  ),
  [FilterType.In]: defineAsyncComponent(
    () => import("#src/components/Message/RightSideBar/Search/Filter/RoomPicker.vue"),
  ),
  [FilterType.Mentions]: UserPicker,
  [FilterType.Pinned]: defineAsyncComponent(
    () => import("#src/components/Message/RightSideBar/Search/Filter/PinPicker.vue"),
  ),
} as const satisfies Record<FilterType, Component>;
