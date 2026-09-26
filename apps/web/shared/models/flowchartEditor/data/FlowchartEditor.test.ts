import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";
import type { ToData } from "@esposter/shared";

import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { GeneralNodeType } from "#shared/models/flowchartEditor/node/GeneralNodeType";
import { ConnectionLineType } from "@vue-flow/core";
import { describe, expect, test } from "vitest";

describe("flowchartEditorSchema", () => {
  // Zod outputs plain objects and toStrictEqual is prototype-sensitive, so compare against a plain clone
  const baseFlowchartEditor: ToData<FlowchartEditor> = structuredClone(new FlowchartEditor());
  const node: GraphNode = {
    data: {},
    id: crypto.randomUUID(),
    position: { x: 0.1, y: 0.1 },
    style: { backgroundColor: "backgroundColor" },
    type: GeneralNodeType.Rectangle,
  };
  const edge: GraphEdge = {
    data: {},
    id: "id",
    source: node.id,
    target: node.id,
    type: ConnectionLineType.Bezier,
  };

  test("keeps a graph as the canvas emits it, minus what the canvas derives", () => {
    expect.hasAssertions();

    const flowchartEditor = { ...baseFlowchartEditor, edges: [edge], nodes: [node] };
    const canvasFlowchartEditor = {
      ...flowchartEditor,
      edges: [{ ...edge, sourceNode: node, sourceX: 0.1, targetNode: node }],
      nodes: [{ ...node, dimensions: { height: 0.1, width: 0.1 }, selected: false }],
    };

    expect(flowchartEditorSchema.parse(canvasFlowchartEditor)).toStrictEqual(flowchartEditor);
  });
});
