import type { Node } from "three/webgpu";

export interface ToonThresholdNodeInputs {
  isLightMapAo: boolean;
  isVertexAo: boolean;
  lightMapGreen: Node<"float">;
  sunTerm: Node<"float">;
  vertexAo: number;
}
