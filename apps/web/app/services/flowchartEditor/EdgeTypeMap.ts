import { ConnectionLineType } from "@vue-flow/core";

// Every path type draws through one labelled edge, which owns the inline label editor a published edge does not need
const FlowchartEditorEdge = defineAsyncComponent(() => import("@/components/FlowchartEditor/Edge/Index.vue"));

export const edgeTypes = Object.fromEntries(
  Object.values(ConnectionLineType).map((connectionLineType) => [connectionLineType, FlowchartEditorEdge]),
);
