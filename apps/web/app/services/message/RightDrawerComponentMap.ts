import { RightDrawer } from "#src/models/message/RightDrawer";

export const RightDrawerComponentMap = {
  [RightDrawer.Member]: defineAsyncComponent(() => import("#src/components/Message/RightSideBar/Member/Index.vue")),
  [RightDrawer.Pinned]: defineAsyncComponent(() => import("#src/components/Message/RightSideBar/Pinned/Index.vue")),
  [RightDrawer.Search]: defineAsyncComponent(() => import("#src/components/Message/RightSideBar/Search/Index.vue")),
  [RightDrawer.Thread]: defineAsyncComponent(() => import("#src/components/Message/RightSideBar/Thread/Index.vue")),
  [RightDrawer.Threads]: defineAsyncComponent(() => import("#src/components/Message/RightSideBar/Threads/Index.vue")),
} as const satisfies Record<RightDrawer, Component>;
