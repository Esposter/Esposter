import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";

export interface FlowchartExportRequest {
  edges: GraphEdge[];
  format: FlowchartExportFormat;
  name: string;
  nodes: GraphNode[];
}
