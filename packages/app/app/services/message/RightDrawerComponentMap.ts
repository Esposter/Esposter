import { RightDrawer } from "@/models/message/RightDrawer";

export const RightDrawerComponentMap = {
  [RightDrawer.Member]: defineAsyncComponent(() => import("@/components/Message/RightSideBar/Member/Index.vue")),
  [RightDrawer.Search]: defineAsyncComponent(() => import("@/components/Message/RightSideBar/Search/Index.vue")),
} as const satisfies Record<RightDrawer, Component>;
