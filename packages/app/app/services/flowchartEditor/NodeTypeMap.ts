import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";

export const NodeTypeMap = {
  [GeneralNodeType.Rectangle]: {
    component: defineAsyncComponent(() => import("@/components/FlowchartEditor/Node/Rectangle.vue")),
    preview: defineAsyncComponent(() => import("@/components/FlowchartEditor/SideBar/Node/Rectangle.vue")),
  },
} as const satisfies Record<GeneralNodeType, { component: Component; preview: Component }>;
