import { NodeType } from "#shared/models/flowchartEditor/data/NodeType";

export const NodeTypeMap = {
  [NodeType.Base]: {
    component: defineAsyncComponent(() => import("@/components/FlowchartEditor/Node/Base.vue")),
    panelContent: defineAsyncComponent(() => import("@/components/FlowchartEditor/PanelContent/Base.vue")),
    preview: defineAsyncComponent(() => import("@/components/FlowchartEditor/SideBar/Node/Base.vue")),
  },
} as const satisfies Record<NodeType, { component: Component; panelContent?: Component; preview: Component }>;
