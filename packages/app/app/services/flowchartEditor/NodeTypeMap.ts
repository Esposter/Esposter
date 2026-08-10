import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";

export const NodeTypeMap: Record<GeneralNodeType, { component: Component; preview: Component }> = {
  [GeneralNodeType.Rectangle]: {
    component: defineAsyncComponent(() => import("@/components/FlowchartEditor/Node/Rectangle.vue")),
    preview: defineAsyncComponent(() => import("@/components/FlowchartEditor/SideBar/Node/Rectangle.vue")),
  },
};
// VueFlow's component registry derived once so the editor and published view can never diverge
export const nodeTypes = Object.fromEntries(
  Object.entries(NodeTypeMap).map(([nodeType, { component }]) => [nodeType, component]),
);
