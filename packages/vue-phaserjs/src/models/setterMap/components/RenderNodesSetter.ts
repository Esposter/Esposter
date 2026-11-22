export const RenderNodesSetter = {
  CustomRenderNodes: "customRenderNodes",
  DefaultRenderNodes: "defaultRenderNodes",
  RenderNodeData: "renderNodeData",
} as const;
export type RenderNodesSetter = (typeof RenderNodesSetter)[keyof typeof RenderNodesSetter];
