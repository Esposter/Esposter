import type { ViewportTransform } from "@vue-flow/core";

export const DEFAULT_VIEWPORT_TRANSFORM = { x: 0, y: 0, zoom: 1 } as const satisfies ViewportTransform;
// What a node's background colour field shows while the node has none of its own: white, as Vue Flow draws a node
export const DEFAULT_NODE_BACKGROUND_COLOR = "#ffffff";
