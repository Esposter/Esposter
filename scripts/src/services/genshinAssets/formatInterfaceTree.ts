import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

const format = (values: readonly number[]): string =>
  values.map((value) => String(Math.round(value * 100) / 100)).join(",");
// A screen's interface tree as text, one piece a line indented by its depth: its name, its anchors, pivot, position and
// Size in canvas units, its scale where it is not one, and its components
export const formatInterfaceTree = (node: InterfaceNode, depth = 0): string => {
  const { anchoredPosition, anchorMax, anchorMin, children, components, name, pivot, scale, sizeDelta } = node;
  const scaleText = scale.every((value) => value === 1) ? "" : ` scale ${format(scale)}`;
  const componentText = components.length > 0 ? ` (${components.join(", ")})` : "";
  const line = `${"  ".repeat(depth)}${name} anchors ${format(anchorMin)} to ${format(anchorMax)}, pivot ${format(pivot)}, at ${format(anchoredPosition)}, size ${format(sizeDelta)}${scaleText}${componentText}`;
  return [line, ...children.map((child) => formatInterfaceTree(child, depth + 1))].join("\n");
};
