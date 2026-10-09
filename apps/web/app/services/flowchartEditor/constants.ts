import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { ViewportTransform } from "@vue-flow/core";

import { ConnectionLineType, MarkerType } from "@vue-flow/core";

export const DEFAULT_VIEWPORT_TRANSFORM = { x: 0, y: 0, zoom: 1 } as const satisfies ViewportTransform;
// What a node's background colour field shows while the node has none of its own: white, as Vue Flow draws a node
export const DEFAULT_NODE_BACKGROUND_COLOR = "#ffffff";
// Every edge a flowchart gets, drawn by hand or made in code: right-angled and arrowed, the way flowcharts are read
export const DEFAULT_EDGE_OPTIONS = { markerEnd: MarkerType.ArrowClosed, type: ConnectionLineType.SmoothStep } as const;
export const EDGE_PATH_TYPE_ITEMS: UiMenuItem<ConnectionLineType>[] = [
  { title: "Curved", value: ConnectionLineType.Bezier },
  { title: "Right-angled", value: ConnectionLineType.SmoothStep },
  { title: "Straight", value: ConnectionLineType.Straight },
];
