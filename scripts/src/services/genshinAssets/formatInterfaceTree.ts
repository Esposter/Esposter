import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

import { formatNumbers } from "#src/services/genshinAssets/formatNumbers";
import { formatTree } from "#src/services/genshinAssets/formatTree";

// A screen's interface tree as text, one piece a line indented by its depth: its name, its anchors, pivot, position and
// Size in canvas units, its scale where it is not one, and its components
export const formatInterfaceTree = (node: InterfaceNode): string =>
  formatTree(node, ({ anchoredPosition, anchorMax, anchorMin, components, name, pivot, scale, sizeDelta }) => {
    const scaleText = scale.every((value) => value === 1) ? "" : ` scale ${formatNumbers(scale)}`;
    const componentText = components.length > 0 ? ` (${components.join(", ")})` : "";
    return `${name} anchors ${formatNumbers(anchorMin)} to ${formatNumbers(anchorMax)}, pivot ${formatNumbers(pivot)}, at ${formatNumbers(anchoredPosition)}, size ${formatNumbers(sizeDelta)}${scaleText}${componentText}`;
  });
